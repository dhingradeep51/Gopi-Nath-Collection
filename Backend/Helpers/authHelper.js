import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

export const comparePassword = async (password, hashedPassword) => {
 
        return bcrypt.compare(password, hashedPassword);
}