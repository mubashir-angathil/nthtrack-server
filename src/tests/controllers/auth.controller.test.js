const authController = require("../../controllers/auth.controller");
const {
  generateAccessToken,
  authenticateJwtToken,
  generateRefreshToken,
} = require("../../utils/helpers/jwt.helper");
const { REFRESH_TOKEN_SECRET } = require("../../configs/configs");
const authService = require("../../services/auth.service");

jest.mock("../../services/auth.service", () => ({
  doSignUp: jest.fn(),
  doSignIn: jest.fn(),
}));

jest.mock("../../utils/helpers/jwt.helper", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  authenticateJwtToken: jest.fn(),
}));

describe("Authentication Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("doSignUp", () => {
    it("should respond with success message and user details on successful sign-up", async () => {
      // Mocking authService.doSignUp to resolve with a user object
      authService.doSignUp.mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "testuser@gmail.com",
      });

      // Mocking generateAccessToken and generateRefreshToken to resolve with tokens
      generateAccessToken.mockResolvedValue("fakeAccessToken");
      generateRefreshToken.mockResolvedValue("fakeRefreshToken");

      // Mock Express request and response objects
      const req = {
        body: {
          username: "testuser",
          email: "testuser@gmail.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await authController.doSignUp(req, res);

      // Assertions
      expect(authService.doSignUp).toHaveBeenCalledWith({
        username: "testuser",
        email: "testuser@gmail.com",
        password: "testpassword",
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Registration successful",
        data: {
          id: 1,
          username: "testuser",
          email: "testuser@gmail.com",
          accessToken: "fakeAccessToken",
          refreshToken: "fakeRefreshToken",
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("doSignIn", () => {
    it("should respond with success message and user details on successful sign-in", async () => {
      // Mocking authService.doSignIn to resolve with a user object
      authService.doSignIn.mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "testuser@gmail.com",
        comparePassword: jest.fn(() => true),
      });

      // Mocking generateAccessToken and generateRefreshToken to resolve with tokens
      generateAccessToken.mockResolvedValue("fakeAccessToken");
      generateRefreshToken.mockResolvedValue("fakeRefreshToken");

      // Mock Express request and response objects
      const req = {
        body: {
          usernameOrEmail: "testuser@gmail.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await authController.doSignIn(req, res);

      // Assertions
      expect(authService.doSignIn).toHaveBeenCalledWith({
        usernameOrEmail: "testuser@gmail.com",
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        data: {
          id: 1,
          username: "testuser",
          email: "testuser@gmail.com",
          accessToken: "fakeAccessToken",
          refreshToken: "fakeRefreshToken",
        },
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // describe("getNewAccessToken", () => {
  //   it("should respond with a new access token on successful refresh", () => {
  //     const req = {
  //       body: {
  //         refreshToken: "fakeRefreshToken",
  //       },
  //     };
  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //     };

  //     // Mocking authenticateJwtToken to resolve with user information
  //     authenticateJwtToken.mockReturnValue({
  //       id: 1,
  //       username: "testuser@gmail.com",
  //     });

  //     // Mocking generateAccessToken to resolve with a new access token
  //     generateAccessToken.mockReturnValue("newAccessToken");

  //     // Call the controller function
  //     authController.getNewAccessToken(req, res);

  //     // Assertions
  //     expect(authenticateJwtToken).toHaveBeenCalledWith({
  //       token: req.body.refreshToken,
  //       secret: REFRESH_TOKEN_SECRET,
  //     });
  //     expect(generateAccessToken).toHaveBeenCalledWith({
  //       id: 1,
  //       username: "testuser@gmail.com",
  //     });
  //     expect(res.status).toHaveBeenCalledWith(200);
  //     expect(res.json).toHaveBeenCalledWith({
  //       success: true,
  //       message: "Authentication successful.",
  //       accessToken: "newAccessToken",
  //     });
  //   });

  //   it("should respond with a 403 status on authentication failure", () => {
  //     const req = {
  //       body: {
  //         refreshToken: "fakeRefreshToken",
  //       },
  //     };
  //     const res = {
  //       status: jest.fn().mockReturnThis(),
  //       json: jest.fn(),
  //     };

  //     // Mocking authenticateJwtToken to throw an error (simulating authentication failure)
  //     authenticateJwtToken.mockImplementation(() => {
  //       throw new Error("Authentication failed");
  //     });

  //     // Call the controller function
  //     authController.getNewAccessToken(req, res);

  //     // Assertions
  //     expect(authenticateJwtToken).toHaveBeenCalledWith({
  //       token: "fakeRefreshToken",
  //       secret: REFRESH_TOKEN_SECRET,
  //     });
  //     expect(res.status).toHaveBeenCalledWith(403);
  //     expect(res.json).toHaveBeenCalledWith({
  //       success: false,
  //       message: "Authentication failed. Please login again",
  //       error: "Authentication failed",
  //     });
  //   });
  // });
});
