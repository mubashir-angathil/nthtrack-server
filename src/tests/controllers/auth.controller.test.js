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
    it("should respond with success message and user details on successful registration", async () => {
      const req = {
        body: {
          username: "testuser@gmail.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authService.doSignUp to resolve with a user object
      authService.doSignUp.mockResolvedValue({
        id: 1,
        username: "testuser@gmail.com",
      });

      // Mocking generateAccessToken and generateRefreshToken to resolve with tokens
      generateAccessToken.mockResolvedValue("fakeAccessToken");
      generateRefreshToken.mockResolvedValue("fakeRefreshToken");

      // Call the controller function
      await authController.doSignUp(req, res);

      // Assertions
      expect(authService.doSignUp).toHaveBeenCalledWith({
        username: "testuser@gmail.com",
        password: "testpassword",
      });
      expect(generateAccessToken).toHaveBeenCalledWith({
        id: 1,
        username: "testuser@gmail.com",
      });
      expect(generateRefreshToken).toHaveBeenCalledWith({
        id: 1,
        username: "testuser@gmail.com",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Registration successful",
        user: {
          username: "testuser@gmail.com",
          userId: 1,
          accessToken: "fakeAccessToken",
          refreshToken: "fakeRefreshToken",
        },
      });
    });

    it("should respond with a 400 status and message if username or password is not provided", async () => {
      const req = {
        body: {
          // Missing username and password intentionally
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await authController.doSignUp(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        err: "Username or password is not provided",
        message: "Internal server error",
      });
    });

    it("should respond with a 400 status and message if authService.doSignUp throws SequelizeUniqueConstraintError", async () => {
      const req = {
        body: {
          username: "duplicateuser",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authService.doSignUp to throw SequelizeUniqueConstraintError
      authService.doSignUp.mockRejectedValue({
        name: "SequelizeUniqueConstraintError",
      });

      // Call the controller function
      await authController.doSignUp(req, res);

      // Assertions
      expect(authService.doSignUp).toHaveBeenCalledWith({
        username: "duplicateuser",
        password: "testpassword",
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Username or email is already in use",
      });
    });

    it("should respond with a 500 status and generic error message for other errors during signup", async () => {
      const req = {
        body: {
          username: "testuser@gmail.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authService.doSignUp to throw a generic error
      authService.doSignUp.mockRejectedValue(
        new Error("Some unexpected error"),
      );

      // Call the controller function
      await authController.doSignUp(req, res);

      // Assertions
      expect(authService.doSignUp).toHaveBeenCalledWith({
        username: "testuser@gmail.com",
        password: "testpassword",
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        err: "Some unexpected error",
      });
    });
  });

  describe("doSignIn", () => {
    it("should respond with success message and user details on successful sign-in", async () => {
      const req = {
        body: {
          username: "testuser@gmail.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authService.doSignIn to resolve with a user object
      authService.doSignIn.mockResolvedValue({
        id: 1,
        username: "testuser@gmail.com",
        comparePassword: jest.fn(() => true), // Mock comparePassword to always return true for testing purposes
      });

      // Mocking generateAccessToken and generateRefreshToken to resolve with tokens
      generateAccessToken.mockResolvedValue("fakeAccessToken");
      generateRefreshToken.mockResolvedValue("fakeRefreshToken");

      // Call the controller function
      await authController.doSignIn(req, res);

      // Assertions
      expect(authService.doSignIn).toHaveBeenCalledWith({
        username: "testuser@gmail.com",
        password: "testpassword",
      });

      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        user: {
          username: "testuser@gmail.com",
          userId: 1,
          accessToken: "fakeAccessToken",
          refreshToken: "fakeRefreshToken",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should respond with a 400 status and message if username or password is not provided during sign-in", async () => {
      const req = {
        body: {
          // Missing username and password intentionally
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      await authController.doSignIn(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username or password is not provided",
        message: "Internal server error",
      });
    });

    it("should respond with a 404 status and message if user is not found during sign-in", async () => {
      const req = {
        body: {
          username: "nonexistentuser",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authService.doSignIn to resolve with null (user not found)
      authService.doSignIn.mockResolvedValue(null);

      // Call the controller function
      await authController.doSignIn(req, res);

      // Assertions
      expect(authService.doSignIn).toHaveBeenCalledWith({
        username: "nonexistentuser",
        password: "testpassword",
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found. Please register if you are a new user.",
      });
    });

    it("should respond with a 401 status and message if password is incorrect during sign-in", async () => {
      const req = {
        body: {
          username: "testuser@gmail.com",
          password: "incorrectpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authService.doSignIn to resolve with a user object
      authService.doSignIn.mockResolvedValue({
        id: 1,
        username: "testuser@gmail.com",
        comparePassword: jest.fn(() => false),
      });

      // Call the controller function
      await authController.doSignIn(req, res);

      // Assertions
      expect(authService.doSignIn).toHaveBeenCalledWith({
        username: "testuser@gmail.com",
        password: "incorrectpassword",
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incorrect password. Please try again.",
      });
    });

    it("should respond with a 500 status and generic error message for other errors during sign-in", async () => {
      const req = {
        body: {
          username: "testuser@gmail.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authService.doSignIn to throw a generic error
      authService.doSignIn.mockRejectedValue(
        new Error("Some unexpected error"),
      );

      // Call the controller function
      await authController.doSignIn(req, res);

      // Assertions
      expect(authService.doSignIn).toHaveBeenCalledWith({
        username: "testuser@gmail.com",
        password: "testpassword",
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: "Some unexpected error",
      });
    });
  });

  describe("getNewAccessToken", () => {
    it("should respond with a new access token on successful refresh", () => {
      const req = {
        body: {
          refreshToken: "fakeRefreshToken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authenticateJwtToken to resolve with user information
      authenticateJwtToken.mockReturnValue({
        id: 1,
        username: "testuser@gmail.com",
      });

      // Mocking generateAccessToken to resolve with a new access token
      generateAccessToken.mockReturnValue("newAccessToken");

      // Call the controller function
      authController.getNewAccessToken(req, res);

      // Assertions
      expect(authenticateJwtToken).toHaveBeenCalledWith({
        token: "fakeRefreshToken",
        secret: REFRESH_TOKEN_SECRET,
      });
      expect(generateAccessToken).toHaveBeenCalledWith({
        id: 1,
        username: "testuser@gmail.com",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ accessToken: "newAccessToken" });
    });

    it("should respond with a 403 status on authentication failure", () => {
      const req = {
        body: {
          refreshToken: "fakeRefreshToken",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mocking authenticateJwtToken to throw an error (simulating authentication failure)
      authenticateJwtToken.mockImplementation(() => {
        throw new Error("Authentication failed");
      });

      // Call the controller function
      authController.getNewAccessToken(req, res);

      // Assertions
      expect(authenticateJwtToken).toHaveBeenCalledWith({
        token: "fakeRefreshToken",
        secret: REFRESH_TOKEN_SECRET,
      });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication failed. Please login again",
        error: "Error",
      });
    });
  });
});
