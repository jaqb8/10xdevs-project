# REST API Plan

This document outlines the REST API for the Language Learning Buddy application. The API is designed to be RESTful, stateless, and secure, leveraging Supabase for authentication and database services.

## 1. Resources

- **Learning Items**
  - **Description**: Represents a single grammar/language error saved by a user.
  - **Database Table**: `public.learning_items`

- **Analysis**
  - **Description**: Represents the action of analyzing a piece of text for errors. This is a non-persistent, action-based resource.
  - **Database Table**: N/A

## 2. Endpoints

All endpoints are prefixed with `/api`.

### 2.1. Learning Items

#### List Learning Items

- **Method**: `GET`
- **Path**: `/learning-items`
- **Description**: Retrieves a paginated list of learning items for the authenticated user, sorted from newest to oldest.
- **Query Parameters**:
  - `page` (optional, integer, default: 1): The page number to retrieve.
  - `pageSize` (optional, integer, default: 20): The number of items per page.
- **Request Payload**: N/A
- **Success Response**:
  - **Code**: `200 OK`
  - **Payload**:
    ```json
    {
      "data": [
        {
          "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "original_sentence": "He don't like apples.",
          "corrected_sentence": "He doesn't like apples.",
          "explanation": "Use 'doesn't' for third-person singular.",
          "created_at": "2025-10-26T10:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "pageSize": 20,
        "totalItems": 1,
        "totalPages": 1
      }
    }
    ```
- **Error Responses**:
  - **Code**: `401 Unauthorized`
  - **Message**: `{ "error": "Authentication required" }`

#### Create Learning Item

- **Method**: `POST`
- **Path**: `/learning-items`
- **Description**: Adds a new learning item to the authenticated user's list.
- **Request Payload**:
  ```json
  {
    "original_sentence": "She have two cats.",
    "corrected_sentence": "She has two cats.",
    "explanation": "Use 'has' for the third-person singular present tense."
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Payload**:
    ```json
    {
      "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
      "user_id": "f1g2h3i4-j5k6-7890-1234-567890abcdef",
      "original_sentence": "She have two cats.",
      "corrected_sentence": "She has two cats.",
      "explanation": "Use 'has' for the third-person singular present tense.",
      "created_at": "2025-10-26T10:05:00Z"
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request`
  - **Message**: `{ "error": "Invalid input", "details": { "explanation": "Explanation cannot exceed 150 characters." } }`
  - **Code**: `401 Unauthorized`
  - **Message**: `{ "error": "Authentication required" }`

#### Delete Learning Item

- **Method**: `DELETE`
- **Path**: `/learning-items/:id`
- **Description**: Deletes a specific learning item belonging to the authenticated user.
- **URL Parameters**:
  - `id` (required, uuid): The ID of the learning item to delete.
- **Request Payload**: N/A
- **Success Response**:
  - **Code**: `204 No Content`
- **Error Responses**:
  - **Code**: `401 Unauthorized`
  - **Message**: `{ "error": "Authentication required" }`
  - **Code**: `403 Forbidden`
  - **Message**: `{ "error": "You do not have permission to delete this item." }`
  - **Code**: `404 Not Found`
  - **Message**: `{ "error": "Learning item not found." }`

### 2.2. Text Analysis

#### Analyze Text

- **Method**: `POST`
- **Path**: `/analyze`
- **Description**: Sends a block of text to be analyzed by the AI model for grammatical errors.
- **Request Payload**:
  ```json
  {
    "text": "I is a student. He go to school."
  }
  ```
- **Success Response (Errors Found)**:
  - **Code**: `200 OK`
  - **Payload**:
    ```json
    {
      "is_correct": false,
      "original_text": "I is a student. He go to school.",
      "corrected_text": "I am a student. He goes to school.",
      "explanation": "Use 'am' with 'I'. Use 'goes' for third-person singular."
    }
    ```
- **Success Response (No Errors)**:
  - **Code**: `200 OK`
  - **Payload**:
    ```json
    {
      "is_correct": true,
      "original_text": "I am a student."
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request`
  - **Message**: `{ "error": "Text cannot exceed 500 characters." }`
  - **Code**: `401 Unauthorized`
  - **Message**: `{ "error": "Authentication required" }`
  - **Code**: `429 Too Many Requests`
  - **Message**: `{ "error": "You have exceeded the analysis limit. Please try again later." }`
  - **Code**: `500 Internal Server Error`
  - **Message**: `{ "error": "An error occurred while analyzing the text." }`

### 2.3. Auth

#### Sign Up

- **Method**: `POST`
- **Path**: `/auth/signup`
- **Description**: Creates a new user account.
- **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "a-strong-password"
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Payload**:
    ```json
    {
      "id": "f1g2h3i4-j5k6-7890-1234-567890abcdef",
      "email": "user@example.com",
      "created_at": "2025-10-26T10:15:00Z"
    }
    ```
  - **Headers**:
    - `Set-Cookie`: `sb-access-token=<access_token>; HttpOnly; Path=/; Secure; SameSite=Lax`
    - `Set-Cookie`: `sb-refresh-token=<refresh_token>; HttpOnly; Path=/; Secure; SameSite=Lax`
- **Error Responses**:
  - **Code**: `400 Bad Request`
  - **Message**: `{ "error": "Invalid email format or password is too weak." }`
  - **Code**: `409 Conflict`
  - **Message**: `{ "error": "User with this email already exists." }`

#### Sign In

- **Method**: `POST`
- **Path**: `/auth/signin`
- **Description**: Authenticates a user and starts a session.
- **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "a-strong-password"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Payload**:
    ```json
    {
      "id": "f1g2h3i4-j5k6-7890-1234-567890abcdef",
      "email": "user@example.com"
    }
    ```
  - **Headers**:
    - `Set-Cookie`: `sb-access-token=<access_token>; HttpOnly; Path=/; Secure; SameSite=Lax`
    - `Set-Cookie`: `sb-refresh-token=<refresh_token>; HttpOnly; Path=/; Secure; SameSite=Lax`
- **Error Responses**:
  - **Code**: `401 Unauthorized`
  - **Message**: `{ "error": "Invalid email or password." }`

#### Sign Out

- **Method**: `POST`
- **Path**: `/auth/signout`
- **Description**: Logs the user out and clears the session cookie.
- **Request Payload**: N/A
- **Success Response**:
  - **Code**: `204 No Content`
- **Error Responses**:
  - **Code**: `401 Unauthorized`
  - **Message**: `{ "error": "Authentication required" }`

## 3. Authentication and Authorization

- **Authentication**: Authentication is handled by the backend's `/api/auth` endpoints. Upon successful sign-in or sign-up, the server, which communicates with Supabase, issues JWTs (access and refresh tokens) to the client via secure, `HttpOnly` cookies. The access token from the cookie will be used by the server to authenticate subsequent requests to protected endpoints.
- **Authorization**: The API server will validate the JWT on every protected request. Authorization logic is primarily enforced at the database level using PostgreSQL Row-Level Security (RLS) policies, as defined in the database plan. This ensures that users can only perform `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations on their own `learning_items`. The API layer will return a `403 Forbidden` or `404 Not Found` error if a user attempts to access another user's data.

## 4. Validation and Business Logic

### Validation Rules

- **POST /analyze**:
  - `text`: Must be a non-empty string.
  - `text`: Must not exceed 500 characters.
- **POST /learning-items**:
  - `original_sentence`: Must be a non-empty string.
  - `corrected_sentence`: Must be a non-empty string.
  - `explanation`: Must be a non-empty string and not exceed 150 characters.
- **POST /auth/signup**:
  - `email`: Must be a valid email address.
  - `password`: Must meet strength requirements (e.g., minimum length).
- **POST /auth/signin**:
  - `email`: Must be a valid email address.
  - `password`: Must be a non-empty string.

### Business Logic Implementation

- **Text Analysis**: The `/api/analyze` endpoint acts as a secure backend proxy. It receives the text from the client, validates it, and then makes a server-to-server call to the external AI service (e.g., OpenRouter.ai). This approach protects API keys and allows for server-side logic like rate limiting and caching (future).
- **Data Association**: For all operations on `/learning-items`, the `user_id` is never taken from the client payload. Instead, it is extracted from the validated JWT session on the server side before performing the database query. This prevents users from associating data with other users.
- **Sorting**: The `GET /learning-items` endpoint will always apply a sort order of `created_at DESC`, backed by a database index on `(user_id, created_at)` for optimal performance.
