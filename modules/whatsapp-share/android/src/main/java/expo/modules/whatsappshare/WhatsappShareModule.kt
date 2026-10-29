package expo.modules.whatsappshare

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class WhatsappShareModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("WhatsappShare")

    // Retorna true se abriu o WhatsApp (normal ou Business), false se nenhum estiver instalado.
    AsyncFunction("sendFile") { fileUri: String, phone: String?, text: String? ->
      val path = Uri.parse(fileUri).path ?: throw IllegalArgumentException("Arquivo inválido")
      val file = File(path)
      if (!file.exists()) throw IllegalArgumentException("Arquivo não encontrado: $path")

      // Mesmo FileProvider declarado pelo expo-sharing (cobre cache e documentos do app)
      val contentUri = FileProvider.getUriForFile(context, context.packageName + ".SharingFileProvider", file)
      val activity = appContext.throwingActivity

      for (pkg in listOf("com.whatsapp", "com.whatsapp.w4b")) {
        val intent = Intent(Intent.ACTION_SEND).apply {
          type = "application/pdf"
          setPackage(pkg)
          putExtra(Intent.EXTRA_STREAM, contentUri)
          if (!text.isNullOrBlank()) putExtra(Intent.EXTRA_TEXT, text)
          val digits = phone?.filter { it.isDigit() }
          if (!digits.isNullOrEmpty()) putExtra("jid", "$digits@s.whatsapp.net")
          addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        try {
          context.grantUriPermission(pkg, contentUri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
          activity.startActivity(intent)
          return@AsyncFunction true
        } catch (e: ActivityNotFoundException) {
          continue
        } catch (e: IllegalArgumentException) {
          continue
        }
      }
      false
    }
  }
}
