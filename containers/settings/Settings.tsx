import ContentForm from "./components/ContentForm";
import WhatsappForm from "./components/WhatsappForm";
import { getSettings } from "./queries";

/** Halaman pengaturan: tiga kartu yang disimpan sendiri-sendiri (SET002). */
export async function Settings() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Pengaturan</h1>
      <div className="flex max-w-4xl flex-col gap-6">
        <WhatsappForm defaultValue={settings.whatsapp_number} />
        <ContentForm
          kind="terms"
          defaultValue={settings.terms_and_conditions}
        />
        <ContentForm kind="profile" defaultValue={settings.company_profile} />
      </div>
    </div>
  );
}
