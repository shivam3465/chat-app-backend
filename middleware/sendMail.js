import nodemailer from "nodemailer";

export const SendMail = async (name, email, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "meforcoding@gmail.com",
      pass: "buyfvfxpavngjjfu"
    }
  });

  const myMessage = `message from ${name} with email id: ${email}, and Message: ${message}`;

  await transporter.sendMail({
    subject: "Mail from portfolio",
    to: process.env.MYMAIL,  
    text: myMessage        
  });
};
