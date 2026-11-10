import { PageHeader } from "@/components/layout/PageHeader";
import ContentForm from "./components/ContentForm";
import LogoForm from "./components/LogoForm";
import WhatsappForm from "./components/WhatsappForm";
import { getSettings } from "./queries";

/** Halaman pengaturan: setiap kartu disimpan sendiri-sendiri (SET002). */
export async function Settings() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Pengaturan"
        description="Logo, nomor WhatsApp, Syarat & Ketentuan, dan Profil Lembaga yang tampil di website donatur."
      />
      <div className="flex max-w-4xl flex-col gap-6">
        <LogoForm defaultValue={settings.logo_url} />
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
