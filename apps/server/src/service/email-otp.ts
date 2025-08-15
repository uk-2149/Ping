import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "utkal2149@gmail.com",
    pass: "dqiq zcez bdnf usjc",
  },
});

export const sendEmail = async (email: string, otp: string) => {
  try {
    const info = await transporter.sendMail({
      from: "utkal2149@gmail.com",
      to: email,
      subject: " Ping",
      text: `Your OTP is: ${otp}`,
    });
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};