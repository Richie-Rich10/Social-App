const express = require('express'); // Importing the Express framework
const cors = require('cors'); // Importing CORS middleware
const bcrypt = require('bcrypt'); // Importing bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Importing jsonwebtoken for token handling
const fs = require('fs'); // Importing the file system module
const path = require('path'); // Importing the path module for file paths

const SERVER_PORT = 3000; // Defining the port for the server
const SECRET_KEY = 'your_secret_key'; // Secret key for JWT (should be stored securely in production)
const USERS_DB_PATH = path.join(__dirname, 'users.json'); // Path to the user database file
const POSTS_DB_PATH = path.join(__dirname, 'posts.json'); // Path to the post database file

// Initialize Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON requests
app.use(cors()); // Enable CORS for all routes

// Helper Functions for Database Interaction

/**
 * Reads a JSON database from a specified file path.
 * @param {string} filePath - The path to the database file.
 * @returns {Array} - Parsed JSON data from the file or an empty array if the file does not exist.
 */
const readDatabase = (filePath) => {
    if (!fs.existsSync(filePath)) { // Check if the file exists
        return []; // Return an empty array if the file doesn't exist
    }
    const data = fs.readFileSync(filePath); // Read the file data
    return JSON.parse(data); // Parse and return the JSON data
};

/**
 * Writes data to a JSON database at the specified file path.
 * @param {string} filePath - The path to the database file.
 * @param {Array} data - The data to be written to the file.
 */
const writeDatabase = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // Write the data to the file with pretty formatting
};

// User Registration

/**
 * Handles user registration.
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object to send back data.
 */
const handleSignUp = async (req, res) => {
    const { username, password } = req.body; // Extract username and password from the request body
    const users = readDatabase(USERS_DB_PATH); // Read existing users from the database
    
    // Check if the user already exists
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' }); // Return error if user exists
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    users.push({ username, password: hashedPassword }); // Add new user to the array
    writeDatabase(USERS_DB_PATH, users); // Write updated user data back to the database
    
    res.status(201).json({ message: 'User registered successfully' }); // Respond with success message
};

// User Login

/**
 * Handles user login.
 * @param {Object} req - The request object containing login credentials.
 * @param {Object} res - The response object to send back data.
 */
const handleLogin = async (req, res) => {
    const { username, password } = req.body; // Extract username and password from the request body
    const users = readDatabase(USERS_DB_PATH); // Read existing users from the database
    const user = users.find(user => user.username === username); // Find the user by username
    
    // Check if the user exists and if the password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' }); // Return error if credentials are invalid
    }
    
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' }); // Generate a JWT token for the user
    res.json({ token }); // Respond with the token
};

// Middleware to Verify User

/**
 * Middleware to verify JWT and authenticate user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const verifyUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
        return res.sendStatus(401); // Return unauthorized if no token is provided
    }
    
    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.sendStatus(403); // Return forbidden if token verification fails
        }
        req.username = decoded.username; // Attach username to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

// Fetch All Accounts

/**
 * Fetches all user accounts.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const fetchAllAccounts = (req, res) => {
    const users = readDatabase(USERS_DB_PATH); // Read existing users from the database
    res.json(users); // Respond with the list of users
};

// Handle User Requests

/**
 * Handles user requests (placeholder logic).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const handleRequest = (req, res) => {
    // Implement request handling logic here
    res.send('Request handled');
};

// Handle Creating a Post

/**
 * Handles the creation of a new post.
 * @param {Object} req - The request object containing post data.
 * @param {Object} res - The response object.
 */
const handleCreatePost = (req, res) => {
    const posts = readDatabase(POSTS_DB_PATH); // Read existing posts from the database
    const { content } = req.body; // Extract content from the request body

    const newPost = { id: posts.length + 1, username: req.username, content }; // Create a new post object
    posts.push(newPost); // Add the new post to the posts array
    writeDatabase(POSTS_DB_PATH, posts); // Write updated post data back to the database
    
    res.status(201).json(newPost); // Respond with the newly created post
};

// Fetch All Posts

/**
 * Fetches all posts.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const fetchAllPosts = (req, res) => {
    const posts = readDatabase(POSTS_DB_PATH); // Read existing posts from the database
    res.json(posts); // Respond with the list of posts
};

// Define other placeholder functions as needed

/**
 * Fetches pending requests (placeholder logic).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const fetchPendingRequests = (req, res) => {
    res.send('Pending requests fetched');
};

/**
 * Handles acceptance of a request (placeholder logic).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const handleAcceptRequest = (req, res) => {
    res.send('Request accepted');
};

/**
 * Fetches posts created by the logged-in user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const fetchUserPosts = (req, res) => {
    const posts = readDatabase(POSTS_DB_PATH).filter(post => post.username === req.username); // Filter posts by the logged-in user
    res.json(posts); // Respond with the user's posts
};

/**
 * Updates privacy settings (placeholder logic).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const handlePrivacySettings = (req, res) => {
    res.send('Privacy settings updated');
};

/**
 * Removes a post by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const handleRemovePost = (req, res) => {
    const posts = readDatabase(POSTS_DB_PATH); // Read existing posts from the database
    const { postId } = req.body; // Extract post ID from the request body
    const updatedPosts = posts.filter(post => post.id !== postId); // Filter out the post to be removed
    writeDatabase(POSTS_DB_PATH, updatedPosts); // Write the updated posts back to the database
    res.send('Post removed'); // Respond with success message
};

/**
 * Likes a post (placeholder logic).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const handleLikePost = (req, res) => {
    res.send('Post liked');
};

/**
 * Adds a comment to a post (placeholder logic).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const handleAddComment = (req, res) => {
    res.send('Comment added');
};

// Set up routes

// User routes
app.post("/register", handleSignUp); // Route for user registration
app.post("/login", handleLogin); // Route for user login
app.get("/accounts", verifyUser, fetchAllAccounts); // Route for fetching all user accounts, requires authentication

// Request handling routes
app.post("/request", verifyUser, handleRequest); // Route for handling user requests
app.get("/pendingRequests", verifyUser, fetchPendingRequests); // Route for fetching pending requests
app.post("/acceptRequest", verifyUser, handleAcceptRequest); // Route for accepting requests

// Post handling routes
app.post("/createPost", verifyUser, handleCreatePost); // Route for creating a new post
app.get("/posts", fetchAllPosts); // Route for fetching all posts
app.get("/userPosts", verifyUser, fetchUserPosts); // Route for fetching posts by the logged-in user
app.post("/updatePrivacySettings", verifyUser, handlePrivacySettings); // Route for updating privacy settings
app.post("/removePost", verifyUser, handleRemovePost); // Route for removing a post
app.post("/likePost", verifyUser, handleLikePost); // Route for liking a post
app.post("/addComment", verifyUser, handleAddComment); // Route for adding a comment to a post

// Start the server
app.listen(SERVER_PORT, () => {
    console.log(`Server is operational on port ${SERVER_PORT}`); // Log a message when the server starts
});
