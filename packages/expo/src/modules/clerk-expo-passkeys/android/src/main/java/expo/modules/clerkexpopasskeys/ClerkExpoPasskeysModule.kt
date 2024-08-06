package expo.modules.clerkexpopasskeys

import AuthenticationResponseJSON
import PublicKeyCredentialCreationOptions
import PublicKeyCredentialRequestOptions
import RegistrationResponseJSON
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.CreateCredentialInterruptedException
import androidx.credentials.exceptions.CreateCredentialProviderConfigurationException
import androidx.credentials.exceptions.CreateCredentialUnknownException
import androidx.credentials.exceptions.CreateCredentialUnsupportedException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialInterruptedException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.NoCredentialException
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException
import com.google.gson.Gson
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch


class ClerkExpoPasskeysModule : Module() {
  private val mainScope = CoroutineScope(Dispatchers.Default)
  
  override fun definition() = ModuleDefinition {
      Name("ClerkExpoPasskeys")

      Function("isSupported") {
          val minApiLevelPasskeys = 28
          val currentApiLevel = android.os.Build.VERSION.SDK_INT
          return@Function currentApiLevel >= minApiLevelPasskeys
      }

      Function("isAutoFillAvailable") {
          false
      }

        AsyncFunction("get") { request: String, promise: Promise ->
            val credentialManager =
                CredentialManager.create(appContext.reactContext?.applicationContext!!)
            val getCredentialRequest =
                GetCredentialRequest(listOf(GetPublicKeyCredentialOption(request)))
    
            mainScope.launch {
                try {
                    val result = appContext.activityProvider?.currentActivity?.let {
                        credentialManager.getCredential(it, getCredentialRequest)
                    }
                    val response =
                     result?.credential?.data?.getString("androidx.credentials.BUNDLE_KEY_AUTHENTICATION_RESPONSE_JSON")
                    val authenticationResponse =
                        Gson().fromJson(response, AuthenticationResponseJSON::class.java)
                    promise.resolve(authenticationResponse)
                } catch (e: GetCredentialException) {
                    promise.reject("Passkey Get", e.message, e)
                }
            }
        }

      

      AsyncFunction("create") { request: String, promise: Promise ->
          val credentialManager =
              CredentialManager.create(appContext.reactContext?.applicationContext!!)
          val createPublicKeyCredentialRequest = CreatePublicKeyCredentialRequest(request)


          mainScope.launch {
              try {
                  val result = appContext.activityProvider?.currentActivity?.let {
                      credentialManager.createCredential(it, createPublicKeyCredentialRequest)
                  }
                  val response =
                      result?.data?.getString("androidx.credentials.BUNDLE_KEY_REGISTRATION_RESPONSE_JSON")
                  val createCredentialResponse =
                      Gson().fromJson(response, RegistrationResponseJSON::class.java)
                  promise.resolve(createCredentialResponse)
              } catch (e: CreateCredentialException) {
                  promise.reject("Passkey Create", e.message, e)
              }
          }
      }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ClerkExpoPasskeysView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: ClerkExpoPasskeysView, prop: String ->
        println(prop)
      }
    }
  }
}
