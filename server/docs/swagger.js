module.exports = {
  swagger: '2.0',
  info: {
    version: '1',
    title: 'Denethor Author\'s Haven',
    description: 'A haven for the creative at heart'
  },
  schemes: ['https'],
  host: 'denethor-ah-backend-staging.herokuapp.com/',
  basePath: 'api/',
  tags: [
    {
      name: 'User',
      description: 'The user of the application'
    },
    {
      name: 'Articles',
      description: 'Activities that go on with an article'
    },
  ],
  paths: {
    '/users/': {
      post: {
        tags: ['User'],
        summary: 'Register a new user to get a verification link',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'firstname',
            in: 'formData',
            description: 'The firstname of the user',
            required: true,
            type: 'string'
          },
          {
            name: 'lastname',
            in: 'formData',
            description: 'The lastname of the user',
            required: false,
            type: 'string'
          },
          {
            name: 'username',
            in: 'formData',
            description: 'The username of the user',
            required: true,
            type: 'string'
          },
          {
            name: 'email',
            in: 'formData',
            description: 'The email of the user',
            required: true,
            type: 'string'
          },
          {
            name: 'password',
            in: 'formData',
            description: 'The password of the user',
            required: true,
            type: 'string'
          },
        ],
        description: 'Registers a new user and returns an email verification link',
        responses: {
          201: {
            description: 'Registration Successful'
          },
          409: {
            description: 'User with the email already exists'
          },
          422: {
            description: 'Unprocessable entity'
          },
          500: {
            description: 'Internal server error'
          }
        }
      },
      get: {
        tags: ['User'],
        summary: 'Get all users that have written an article at least once',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          200: {
            description: 'Users retrieved successfully'
          },
          401: {
            description: 'Unauthorized'
          },
          500: {
            description: 'Error retrieving users'
          }
        }
      }
    },
    '/users/{id}/verify': {
      patch: {
        tags: ['User'],
        summary: 'Verify user account to get a token and continue using the platform',
        description: 'Returns a token to the user who has just signed up after the user clicks on the link sent to the user\'s email',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'User Id of the user to be verified',
            required: true,
            type: 'string'
          },
        ],
        responses: {
          200: {
            description: 'User successfully verified'
          },
          400: {
            description: 'User already verified'
          },
          404: {
            description: 'User does not exist'
          },
          500: {
            description: 'Internal server error'
          }
        }
      },
    },
    '/users/login': {
      post: {
        tags: ['User'],
        summary: 'Login a user ',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'email',
            in: 'formData',
            description: 'The email of the user',
            required: true,
            type: 'string'
          },
          {
            name: 'password',
            in: 'formData',
            description: 'The password of the user',
            required: true,
            type: 'string'
          },
        ],
        description: 'Login a user',
        responses: {
          200: {
            description: 'Login successful'
          },
          401: {
            description: 'Incorrect login credentials'
          },
          403: {
            description: 'Email not verified'
          }
        }
      }
    },
    'users/{id}': {
      get: {
        tags: ['User'],
        summary: 'A user with an admin token can get a specific user',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'id',
            in: 'path',
            description: 'Id of user data to be obtained',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get a specific user',
        responses: {
          200: {
            description: 'User found'
          },
          403: {
            description: 'Requester is not an admin'
          },
          404: {
            description: 'User whose id is provided does not exist'
          },
          500: {
            description: 'Internal server error'
          },
        }
      },
      delete: {
        tags: ['User'],
        summary: 'A user with an admin token can delete a specific user',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'id',
            in: 'path',
            description: 'Id of user data to be deleted',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          200: {
            description: 'User delete Successful'
          },
          403: {
            description: 'Requester is not an admin'
          },
          404: {
            description: 'User whose id is provided does not exist'
          },
          500: {
            description: 'Internal server error'
          },
        }
      }
    },
    '/users/{userId}/follow': {
      post: {
        tags: ['User'],
        summary: 'Follow a user ',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'id',
            in: 'path',
            description: 'Id of the user to be followed',
            required: true,
            type: 'string'
          },
        ],
        description: 'Follow a user',
        responses: {
          201: {
            description: 'Followed successfully'
          },
          500: {
            description: 'Internal server error'
          },
          404: {
            description: 'Accounts not found'
          },
          401: {
            description: 'Unauthorized'
          },
        }
      }
    },
    '/users/admin': {
      patch: {
        tags: ['User'],
        summary: 'Admin can make a user an admin',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'pass',
            in: 'formData',
            description: 'The admin secret key',
            required: true,
            type: 'string'
          },
        ],
        description: 'Admin can make a user an admin',
        responses: {
          200: {
            description: 'Upgrade user to admin successful'
          },
          403: {
            description: 'Wrong admin pass'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'users/role': {
      patch: {
        tags: ['User'],
        summary: 'Change the role of a user',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'id',
            in: 'formData',
            description: 'The Id of the user, whose role is to be changed',
            required: true,
            type: 'string'
          },
          {
            name: 'role',
            in: 'formData',
            description: 'The role to be assigned to a user',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          200: {
            description: 'User role changed successfully'
          },
          404: {
            description: 'User not found'
          },
          403: {
            description: 'Unauthorized'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/google': {
      get: {
        tags: ['User'],
        summary: 'A user can create account or login with google',
        consumes: ['application/x-www-form-urlencoded'],
        description: 'A user can create account or login with google',
        responses: {
          200: {
            description: 'Successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/facebook': {
      get: {
        tags: ['User'],
        summary: 'A user can create account or login with facebook',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
        ],
        description: 'A user can create account or login with facebook',
        responses: {
          200: {
            description: 'Successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/twitter': {
      get: {
        tags: ['User'],
        summary: 'A user can create account or login with twitter',
        consumes: ['application/x-www-form-urlencoded'],
        description: 'A user can create account or login with twitter',
        responses: {
          200: {
            description: 'Successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/google/redirect': {
      get: {
        tags: ['User'],
        summary: 'A user can create account or login with google and be redirected to the application',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
        ],
        description: 'A user can create account or login with google and be redirected to the application',
        responses: {
          200: {
            description: 'Login successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/facebook/redirect': {
      get: {
        tags: ['User'],
        summary: 'A user can create account or login with facebook and be redirected to the application',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
        ],
        description: 'A user can create account or login with facebook and be redirected to the application',
        responses: {
          200: {
            description: 'Login successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/twitter/redirect': {
      get: {
        tags: ['User'],
        summary: 'A user can create account or login with twitter and be redirected to the application',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
        ],
        description: 'A user can create account or login with twitter and be redirected to the application',
        responses: {
          200: {
            description: 'Login successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/resetpassword': {
      post: {
        tags: ['User'],
        summary: 'User can  reset their password',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'Email',
            in: 'formData',
            description: 'Email used for registration on Author\'s Haven where a link to reset the password will be sent',
            required: true,
            type: 'string'
          },
        ],
        description: 'User can  reset their password',
        responses: {
          200: {
            description: 'Email confirmation sent successfully'
          },
          404: {
            description: 'User not found'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    '/users/resetpassword/{token}': {
      patch: {
        tags: ['User'],
        summary: 'User can  reset their password when they click on the link sent to their email',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Token',
            in: 'path',
            description: 'User token of the requester',
            required: true,
            type: 'string'
          },
        ],
        description: 'User can  reset their password',
        responses: {
          200: {
            description: 'Successful password reset'
          },
          404: {
            description: 'User not found'
          },
          401: {
            description: 'Expired token'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'users/logout/': {
      get: {
        tags: ['User'],
        summary: 'Logout a user',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
        ],
        description: 'Logout a user',
        responses: {
          200: {
            description: 'Logout user'
          },
          500: {
            description: 'Server error'
          }
        }
      }
    },

    '/articles/?category': {
      post: {
        tags: ['Articles'],
        summary: 'A user with a valid token can create an article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'title',
            in: 'formData',
            description: 'Title of the article',
            required: true,
            type: 'string'
          },
          {
            name: 'description',
            in: 'formData',
            description: 'Description of the article',
            required: true,
            type: 'string'
          },
          {
            name: 'body',
            in: 'formData',
            description: 'Body of the article',
            required: true,
            type: 'string'
          },
          {
            name: 'categoryId',
            in: 'formData',
            description: 'CategoryId of the article',
            required: true,
            type: 'string'
          },
          {
            name: 'references',
            in: 'formData',
            description: 'References for the article',
            required: true,
            type: 'string array'
          },
        ],
        description: 'Create an article',
        responses: {
          201: {
            description: 'Article created Successfully'
          },
          500: {
            description: 'Internal server error'
          }
        }
      },
      get: {
        tags: ['Articles'],
        summary: 'A user can get all articles with a specific category',
        consumes: ['application/x-www-form-urlencoded'],
        description: 'A user can get all articles with a specific category',
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'The category name of the article',
            required: false,
            type: 'string'
          },
        ],
        responses: {
          200: {
            description: 'Successful'
          },
          404: {
            description: 'The category type does not exist'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'articles/{id}': {
      get: {
        tags: ['Articles'],
        summary: 'A user with a valid token can get a specific article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          200: {
            description: 'Successful'
          },
          404: {
            description: 'Resource not found'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'articles/{id}/report': {
      post: {
        tags: ['Articles'],
        summary: 'A user with a valid token can get a specific article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'Article Id',
            in: 'path',
            description: 'Id of the article to be reported',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          201: {
            description: 'Parcel created Successfully'
          },
          404: {
            description: 'No article with the id'
          },
          422: {
            description: 'You already updated the article'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'articles/{id}/likes': {
      patch: {
        tags: ['Articles'],
        summary: 'A user with a valid token can get a specific article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'Id',
            in: 'path',
            description: 'Id of the article to be liked',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          200: {
            description: 'Aricle liked'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'articles/{id}/dislikes': {
      patch: {
        tags: ['Articles'],
        summary: 'A user with a valid token can get a specific article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'Id',
            in: 'path',
            description: 'Article Id of the article to dislike',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          200: {
            description: 'Aricle disliked'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'articles/{id}/highlights': {
      post: {
        tags: ['Articles'],
        summary: 'A user can highlight specific article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'Id',
            in: 'path',
            description: 'Id of the article that is being highlighted',
            required: true,
            type: 'string'
          },
        ],
        description: 'A valid user can be highlight a portion of an article',
        responses: {
          201: {
            description: 'Highlight Successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'articles/{articleId}/ratings': {
      post: {
        tags: ['Articles'],
        summary: 'A valid user can rate an article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'Id',
            in: 'path',
            description: 'Id of the article',
            required: true,
            type: 'string'
          },
        ],
        description: 'A valid user can rate an article',
        responses: {
          201: {
            description: 'You rated this article'
          },
          404: {
            description: 'Article not found'
          },
          401: {
            description: 'You already rated this article'
          },
          502: {
            description: 'Error'
          }
        }
      }
    },
    'articles/{articleId}/comments': {
      get: {
        tags: ['Articles'],
        summary: 'A user with a valid token can comment on a specific article',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'Id',
            in: 'path',
            description: 'Article Id',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          201: {
            description: 'Successful'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }
    },
    'articles/{id}/comments/{commentId}': {
      patch: {
        tags: ['Articles'],
        summary: 'A user a valid token edit a comment with the article\'s id',
        consumes: ['application/x-www-form-urlencoded'],
        parameters: [
          {
            name: 'Bearer',
            in: 'header',
            description: 'Authorization token',
            required: true,
            type: 'string'
          },
          {
            name: 'id',
            in: 'path',
            description: 'Article Id',
            required: true,
            type: 'string'
          },
          {
            name: 'commentId',
            in: 'path',
            description: 'Comment Id',
            required: true,
            type: 'string'
          },
        ],
        description: 'Get all users that have written an article at least once',
        responses: {
          200: {
            description: 'Parcel created Successfully'
          },
          401: {
            description: 'There Was an Error creating the parcel delivery order'
          }
        }
      }
    },
  },

};
