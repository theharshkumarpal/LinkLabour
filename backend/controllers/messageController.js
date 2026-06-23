import prisma from '../config/prisma.js';

export const getMessages = async (req, res) => {
  try {
    const jobMessages = await prisma.message.findMany({
      where: { jobId: req.params.jobId }
    });
    res.json(jobMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

export const sendMessage = async (req, res) => {
  const { jobId, senderId, senderName, receiverId, content } = req.body;
  try {
    const newMsg = await prisma.message.create({
      data: {
        id: `msg-${Date.now()}`,
        jobId,
        senderId,
        senderName,
        receiverId,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    });

    // Trigger simulated AI auto-responses for mock users
    const isMockReceiver = !receiverId.startsWith('poster-') && !receiverId.startsWith('worker-'); 
    const isOriginalMock = ['poster-1', 'poster-2', 'poster-3', 'poster-4', 'worker-1', 'worker-2', 'worker-3', 'worker-4'].includes(receiverId) && receiverId !== senderId;

    if (isMockReceiver || isOriginalMock) {
      setTimeout(async () => {
        try {
          const senderObj = await prisma.user.findUnique({
            where: { id: senderId }
          });
          const isSenderPoster = senderObj ? senderObj.role === 'poster' : true;
          
          let replyText = '';
          if (isSenderPoster) {
            const replies = [
              `Thank you for your message! Yes, I will be reaching your location at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} tomorrow. Please make sure the workspace is clear.`,
              "I have all the tools needed. If there are any specific material specifications you prefer, please text me.",
              "I'm on it. Ready to start and will guarantee the highest quality execution.",
            ];
            replyText = replies[Math.floor(Math.random() * replies.length)];
          } else {
            const replies = [
              "Great, thank you for checking in. I will review your bid shortly. Let me know if you can do it within our set budget.",
              "Looks good. Are you open to starting a bit earlier on the target date?",
              "Wonderful profile, I'm glad you applied. Let's align on details.",
            ];
            replyText = replies[Math.floor(Math.random() * replies.length)];
          }

          const recUser = await prisma.user.findUnique({
            where: { id: receiverId }
          });
          const partnerName = recUser ? recUser.name : 'Client/Technician';

          await prisma.message.create({
            data: {
              id: `msg-${Date.now() + 1}`,
              jobId,
              senderId: receiverId,
              senderName: partnerName,
              receiverId: senderId,
              content: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          });

          // Create alert notification
          await prisma.notification.create({
            data: {
              id: `notif-${Date.now()}`,
              userId: senderId,
              text: `New chat reply from ${partnerName} regarding your task request.`,
              read: false,
              date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          });
        } catch (err) {
          console.error('Simulated auto-reply error:', err);
        }
      }, 2000);
    }

    res.json({ success: true, message: newMsg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};
