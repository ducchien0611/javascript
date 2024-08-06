import ExpoModulesCore
import AuthenticationServices

public class ClerkExpoPasskeysModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ClerkExpoPasskeys')` in JavaScript.
    Name("ClerkExpoPasskeys")

    AsyncFunction("create") { ( challenge: String,
                                      rpId: String,
                                      userId: String,
                                      displayName: String,
                                      promise: Promise ) in
            
            guard let challenge = Data.fromBase64Url(challenge) else {
                promise.rejectWith(passkeyError: PasskeyError.InvalidChallenge)
                return
            }
            guard let userId = Data.fromBase64Url(userId) else {
                promise.rejectWith(passkeyError: PasskeyError.InvalidUserId)
                return
            }
            
            // Passkey support came with iOS 16
            if #available(iOS 15.0, *) {
                let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
                let authRequest = platformProvider.createCredentialRegistrationRequest(challenge: challenge, name: displayName, userID: userId)
                let authController = ASAuthorizationController(authorizationRequests: [authRequest])
                let passkeyDelegate = PasskeyDelegate();
                
                // Perform authorization, check for the error and parse the result
                passkeyDelegate.performAuth(for: authController, completion: { error, result in
                    if (error != nil) {
                        promise.rejectWith(passkeyError: self.convertNativeError(error: error!))
                        return
                    }
                    
                    // Check if the result object contains a valid registration result
                    if let registrationResult = result?.registrationResult {
                        // Return a NSDictionary instance with the received authorization data
                        let authResult: NSDictionary = [
                            "credentialID": registrationResult.credentialID.toBase64Url(),
                            "response": [
                                "rawAttestationObject": registrationResult.rawAttestationObject.toBase64Url(),
                                "rawClientDataJSON": registrationResult.rawClientDataJSON.toBase64Url(),
                            ]
                        ]
                        promise.resolve(authResult)
                    } else {
                        // If result didn't contain a valid registration result throw an error
                        promise.rejectWith(passkeyError: PasskeyError.RequestFailed)
                    }
                })
            } else {
                promise.rejectWith(passkeyError: PasskeyError.NotSupported)
            }
        }


        AsyncFunction("get") { (challenge: String,
                                         rpId: String,
                                         allowedCredentials: [String],
                                         promise: Promise) in
            guard let challenge = Data.fromBase64Url(challenge) else {
                promise.rejectWith(passkeyError: PasskeyError.InvalidChallenge)
                return
            }
            
            if #available(iOS 15.0, *) {
                let platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
                let authRequest = platformProvider.createCredentialAssertionRequest(challenge: challenge)

                // Try to parse included credentials and add it to the auth request
                do {
                    let credentialDescriptors = try parseCredentials(allowedCredentials)
                    authRequest.allowedCredentials = credentialDescriptors
                } catch let error as PasskeyError {
                    promise.rejectWith(passkeyError: error)
                    return
                }
                let authController = ASAuthorizationController(authorizationRequests: [authRequest])
                let passkeyDelegate = PasskeyDelegate();
                passkeyDelegate.performAuth(for: authController, completion: { error, result in
                    if (error != nil) {
                        promise.rejectWith(passkeyError: self.convertNativeError(error: error!))
                        return
                    }
                    
                    // Check if the result object contains a valid authentication result
                    if let authenticationResult = result?.authenticationResult {
                        let authResult: NSDictionary = [
                            "credentialID": authenticationResult.credentialID.toBase64Url(),
                            "userID": authenticationResult.userID.toBase64Url(),
                            "response": [
                                "rawAuthenticatorData": authenticationResult.rawAuthenticatorData.toBase64Url(),
                                "rawClientDataJSON": authenticationResult.rawClientDataJSON.toBase64Url(),
                                "signature": authenticationResult.signature.toBase64Url(),
                            ]
                        ]
                        promise.resolve(authResult)
                    } else {
                        promise.rejectWith(passkeyError: PasskeyError.RequestFailed)
                    }
                })
            } else {
                promise.rejectWith(passkeyError: PasskeyError.NotSupported)
            }
        }
    }


    func convertNativeError(error: Error) -> PasskeyError {
        let errorCode = (error as NSError).code
        switch errorCode {
        case 1001:
            return PasskeyError.Cancelled
        case 1004:
            return PasskeyError.RequestFailed
        case 4004:
            return PasskeyError.NotConfigured
        default:
            return PasskeyError.UnknownError
        }
    }


    @available(iOS 15, *)
    func parseCredentials(_ credentials: [String]) throws -> [ASAuthorizationPlatformPublicKeyCredentialDescriptor] {
        guard credentials.count > 0 else { return [] }

        var formattedCredentials: [Data] = []
        for credential in credentials {
            guard let data = Data.fromBase64Url(credential) else {
                throw PasskeyError.InvalidChallenge
            }
            formattedCredentials.append(data)
        }

        return formattedCredentials.map { ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: $0) }
    }
        

    // Defines event names that the module can send to JavaScript.
    // Events("onChange")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    // AsyncFunction("setValueAsync") { (value: String) in
    //   // Send an event to JavaScript.
    //   self.sendEvent("onChange", [
    //     "value": value
    //   ])
    // }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
  //   View(ClerkExpoPasskeysView.self) {
  //     // Defines a setter for the `name` prop.
  //     Prop("name") { (view: ClerkExpoPasskeysView, prop: String) in
  //       print(prop)
  //     }
  //   }
  // }
}
