const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Models
const User = require("./models/User");

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize Express App
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API Routes (uncomment when route files are created)
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const gigRoutes = require("./routes/gig");
const orderRoutes = require("./routes/order");
const reviewRoutes = require("./routes/review");
const messageRoutes = require("./routes/message");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);

// Health Check Route
// app.get("/", (req, res) => {
//     res.json({
//         message: "Freelancers Marketplace API is running!",
//         status: "OK",
//         timestamp: new Date().toISOString()
//     });
// });

// // API Health Check
// app.get("/api/health", (req, res) => {
//     res.json({
//         status: "healthy",
//         uptime: process.uptime(),
//         environment: process.env.NODE_ENV
//     });
// });

// 🧪 TEST ROUTE - Database Schema Test (delete nahi karega, sirf create karega)
app.get("/api/test-db", async (req, res) => {
    try {
        // Create a test user with unique email
        const timestamp = Date.now();
        const testUser = new User({
            name: "Test User",
            email: `test${timestamp}@example.com`,
            password: "test123456",
            userType: "freelancer"
        });

        // Save to database
        const savedUser = await testUser.save();
        console.log("✅ Test user created:", savedUser._id);

        // NOTE: User delete NAHI kar rahe taaki Atlas mein dikhe
        res.json({
            success: true,
            message: "Test user created successfully! Check MongoDB Atlas now.",
            testData: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                userType: savedUser.userType,
                createdAt: savedUser.createdAt
            }
        });
    } catch (error) {
        console.error("❌ Database test failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Database test failed",
            error: error.message
        });
    }
});
// });

// Socket.io Connection Handling
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a conversation room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Handle sending messages
    socket.on("sendMessage", (data) => {
        // Use orderId if available, otherwise use gigId-based room
        const roomId = data.orderId || `inquiry_${data.gigId}_${data.senderId._id || data.senderId}`;
        io.to(roomId).emit("receiveMessage", data);
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
        const roomId = data.orderId || `inquiry_${data.gigId}_${data.userId}`;
        socket.to(roomId).emit("userTyping", { userId: data.userId, isTyping: data.isTyping });
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("error:", err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// // 404 Handler
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "Route not found"
//     });
// });

// Start Server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`
  ========================================
  🚀 Server running on port ${PORT}
  📊 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 URL: http://localhost:${PORT}
  ========================================
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.log(err.name, err.message);
    httpServer.close(() => {
        process.exit(1);
    });
});
