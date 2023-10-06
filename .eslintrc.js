module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "standard",
  plugins: ["prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  rules: {
    "no-console": "warn", // Warns about the use of console statements
    "linebreak-style": ["error", "unix"], // Enforces Unix line endings
    quotes: ["error", "double"], // Enforces the use of double quotes,
    "comma-dangle": ["error", "always-multiline"],
    "semi-style": ["error", "last"],
    "prettier/prettier": "error", // Prettier Rules for Code Style
  },
}
