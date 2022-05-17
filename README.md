# Bharat-Bank
It is a Web application and simple implementation of a commercial Bank website built using HTML, CSS and JavaScript for the Frontend, Nodejs and 
ExpressJs for the Backend, MongoDB for the Database, and JWT and  OAuth2.0 for Authentication and Authorization.

It has a signup/login feature. We can either signup with **Google** or use the traditional email and password method. 
After successful login, the user is redirected to the Dashboard.
It displays the name of the user, profile picture, account number, and balance.

Google signup is achieved with the help of **OAuth2.0 authorization** by using Google API. It is achieved with the help of **Google Developer Docs.**
These simple steps were followed : 
 1. Obtain **OAuth 2.0 credentials** from the Google API Console.
 2. Obtain an access token from the Google Authorization Server.
 3. Examine scopes of access granted by the user.
 4. Send the access token to an API.

![OAuth2 0 -1](https://user-images.githubusercontent.com/71374972/168765136-45722ffd-15f6-4465-8bd2-66f54cf8d103.png)


**JWT authentication** is used for signing in with Email and password.
JSON Web Token (JWT) is an open standard that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. 
This information can be verified and trusted because it is **digitally signed.**
JWTs can be signed using a **secret** (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.

Each user is verified with the help of a **JWT token** that is generated at the time of signup.  
The token comprises three parts **Header, Payload, and Signature**.
These are stored in JSON format.
The header has two keys: type and algorithm. 
Payload is the part where actual data is stored.
The **signature** is present to verify the authenticity of the token.
![jwt-33](https://user-images.githubusercontent.com/71374972/168766906-2418c24a-a13e-40a9-b96d-edff762bf3c5.png)




# Landing Page

![Bharat Bank-1](https://user-images.githubusercontent.com/71374972/168759292-00086ee8-450a-4b33-b48c-721f487d1aa8.png)

# Login Page

![Bharat Bank -3](https://user-images.githubusercontent.com/71374972/168759504-00ab3142-9129-4408-84dc-c608eae29504.png)

# Transfer Money Page

![Bharat bank-2](https://user-images.githubusercontent.com/71374972/168759657-3c156712-dcbd-440a-bf58-45cd2994ccfb.png)

The user can perform the  transaction of transer money in the application. The user must be logged in to make a transaction.
The Account number and Email ID of the user is verified at the backend to make a transaction.
A error message will be displayed and transaction will be aborted in case of a problem in verification or problem with amount.

Once the transaction is executed successully. The user is redirected to Payment successful page.
If the transaction is aborted due to any problem  the user is redirected to the Payment failed page.
The transaction once completed is stored in the database and displyed in the transactions tab.
Upon every transaction, a unique  transaction ID of 32 characters is generated.

### If you find a Bug, It’s not a bug – it’s an undocumented feature XD :)
