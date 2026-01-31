import nodemailer from 'nodemailer';
import TicketModel from "../Models/ticketModel.js";
import path from 'path';
import fs from 'fs';
import { sendNotification } from '../Utils/notificationUtils.js';
/* =====================================================
   1. CREATE TICKET (USER SIDE)
===================================================== */
export const contactUsController = async (req, res) => {
    try {
        const { name, email, subject, message, userId } = req.body;

        if (!name || !email || !subject || !message || !userId) {
            return res.status(400).send({ 
                success: false, 
                message: "All fields are required. Please ensure you are logged in." 
            });
        }

        const ticketId = `GN-${Math.floor(100000 + Math.random() * 900000)}`;

        const attachmentPath = req.file ? req.file.path.replace(/\\/g, "/") : "";

        const newTicket = await TicketModel.create({
            ticketId,
            userId,      
            name,
            email,
            subject,
            message,
            attachment: attachmentPath
        });

        // ✅ TRIGGER REAL-TIME NOTIFICATION FOR ADMIN
        // We use the ticketId as the reference number
        sendNotification(req, "USER_TICKET_ALERT", { orderId: ticketId });

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            pool: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const userHtml = `
            <div style="font-family: serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 30px; background-color: #2D0A14; color: white; text-align: center;">
                <h1 style="color: #D4AF37;">Gopi Nath Collection</h1>
                <h2 style="color: white;">Ticket Received: #${ticketId}</h2>
                <p>Hello ${name},</p>
                <p>We have received your inquiry regarding "<strong>${subject}</strong>".</p>
                <div style="margin: 20px 0; padding: 15px; border: 1px dashed #D4AF37; display: inline-block; color: #D4AF37;">
                    <strong>TICKET ID: ${ticketId}</strong>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Gopi Nath Support" <noreply@gopinathcollection.co.in>`,
            to: email,
            subject: `Support Ticket Created: #${ticketId}`,
            html: userHtml,
        });

        res.status(200).send({ success: true, message: "Ticket raised successfully!", ticketId });
    } catch (error) {
        console.error("Create Ticket Error:", error);
        res.status(500).send({ success: false, message: "Error raising ticket", error: error.message });
    }
};

/* =====================================================
   2. FETCH ALL TICKETS (ADMIN SIDE)
===================================================== */
export const getAllTicketsController = async (req, res) => {
    try {
        const tickets = await TicketModel.find({})
            .populate("userId", "customId name email")
            .sort({ createdAt: -1 });
        res.status(200).send({ success: true, tickets });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).send({ success: false, message: "Error fetching tickets" });
    }
};

/* =====================================================
   3. TICKET STATISTICS (ADMIN SIDE)
===================================================== */
export const getTicketStatsController = async (req, res) => {
    try {
        const [pendingCount, resolvedCount, totalTickets] = await Promise.all([
            TicketModel.countDocuments({ status: "Pending" }),
            TicketModel.countDocuments({ status: "Resolved" }),
            TicketModel.countDocuments()
        ]);
        res.status(200).send({ success: true, pendingCount, resolvedCount, totalTickets });
    } catch (error) {
        res.status(500).send({ success: false, message: "Error fetching stats" });
    }
};

/* =====================================================
   4. REPLY TO TICKET & SEND EMAIL (ADMIN SIDE)
===================================================== */
export const replyTicketController = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyMessage } = req.body;
        
        // Capture and normalize path from Multer
        const adminAttachment = req.file ? req.file.path.replace(/\\/g, "/") : null; 

        const ticket = await TicketModel.findById(id);
        if (!ticket) return res.status(404).send({ success: false, message: "Ticket not found" });

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const replyHtml = `
            <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; border: 2px solid #D4AF37; padding: 30px; background-color: #2D0A14; color: white;">
                <h2 style="color: #D4AF37; text-align: center;">GNC Support Update</h2>
                <p>Dear ${ticket.name},</p>
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                    <strong style="color: #D4AF37;">Official Response:</strong>
                    <p>${replyMessage}</p>
                </div>
                <p>Track this ticket in your dashboard.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"GNC Support" <${process.env.EMAIL_USER}>`,
            to: ticket.email,
            subject: `Update on Ticket #${ticket.ticketId}`,
            html: replyHtml,
            attachments: adminAttachment ? [{ 
                filename: req.file.originalname, 
                path: adminAttachment 
            }] : []
        });

        // ✅ Updated field names to match UserTickets.jsx map (r.adminMessage, r.adminAttachment)
        ticket.status = "Resolved";
        ticket.replies.push({ 
            adminMessage: replyMessage, 
            adminAttachment: adminAttachment, 
            repliedAt: new Date()
        });

        await ticket.save({ validateBeforeSave: false });

        res.status(200).send({ 
            success: true, 
            message: "Reply and attachment saved successfully."
        });
    } catch (error) {
        console.error("Reply System Error:", error);
        res.status(500).send({ success: false, message: "Server error during reply delivery." });
    }
};

/* =====================================================
   5. DELETE TICKET (ADMIN SIDE)
===================================================== */
export const deleteTicketController = async (req, res) => {
    try {
        await TicketModel.findByIdAndDelete(req.params.id);
        res.status(200).send({ success: true, message: "Ticket deleted" });
    } catch (error) {
        res.status(500).send({ success: false, message: "Delete failed" });
    }
};

/* =====================================================
   6. TRACK USER TICKETS (USER SIDE)
===================================================== */
export const getUserTicketsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const tickets = await TicketModel.find({ userId }).sort({ createdAt: -1 });
        res.status(200).send({ success: true, tickets });
    } catch (error) {
        console.error("Fetch User Tickets Error:", error);
        res.status(500).send({ success: false, message: "Error fetching user tickets" });
    }
};

/* =====================================================
   7. SERVE ADMIN REPLY ATTACHMENT
===================================================== */
export const isAdminReplyAttachmentController = async (req, res) => {
    try {
        const { id, replyIndex } = req.params;
        
        console.log("--- FETCH ATTACHMENT DEBUG ---");
        const ticket = await TicketModel.findById(id);

        if (!ticket) return res.status(404).send({ success: false, message: "Ticket not found" });

        const reply = ticket.replies[replyIndex];
        if (!reply) return res.status(404).send({ success: false, message: "Reply not found" });

        const filePath = reply.adminAttachment;
        if (!filePath) return res.status(404).send({ success: false, message: "No attachment path" });

        // Resolve absolute path to fix ReferenceErrors
        const absolutePath = path.resolve(filePath);

        if (fs.existsSync(absolutePath)) {
            res.sendFile(absolutePath);
        } else {
            res.status(404).send({ success: false, message: "File missing on server" });
        }
    } catch (error) {
        console.error("FETCH ATTACHMENT CRASH:", error);
        res.status(500).send({ success: false, message: "Error serving file" });
    }
};

/* =====================================================
   8. SERVE USER ORIGINAL ATTACHMENT
===================================================== */
export const getUserAttachmentController = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await TicketModel.findById(id);

        if (!ticket || !ticket.attachment) {
            return res.status(404).send({ success: false, message: "No attachment found" });
        }

        const filePath = path.resolve(ticket.attachment);

        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send({ success: false, message: "File missing on disk" });
        }
    } catch (error) {
        console.error("User Attachment Error:", error);
        res.status(500).send({ success: false, message: "Error serving user file" });
    }
};