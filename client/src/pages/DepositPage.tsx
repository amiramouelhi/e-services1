import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DepositPage = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([""]);
  const [referenceFacture, setReferenceFacture] = useState("");

  const addAuthor = () => {
    setAuthors([...authors, ""]);
  };

  // const updateAuthor = (index, value) => {
  //   const updated = [...authors];
  //   updated[index] = value;
  //   setAuthors(updated);
  // };

  // const handleValidate = (e) => {
  //   e.preventDefault();
  //   alert("Formulaire validé");
  // };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour
          </button>
          <h1 className="text-xl font-bold text-foreground">Page de Dépôt</h1>
          <div />
        </div>
{/* onSubmit={handleValidate} */}
        <form >
          <div className="bg-card rounded-md shadow-sm border border-border p-6 mb-6">
            {/* Section A - Le déposant */}
            <SectionHeader left="Le déposant" right="المودع" />

            <div className="space-y-4 mt-4">
              <BilingualField labelFr="Nom et prénom" labelAr="الإسم واللقب" />
              <BilingualField labelFr="Pièce d'identité" labelAr="بطاقة الهوية" />
              <BilingualField labelFr="Raison sociale" labelAr="الإسم الحمائي" />
              <BilingualField
                labelFr="N° lieu et date d'enregistrement au registre de commerce"
                labelAr="رقم و مكان و تاريخ التسجيل بالدفتر التجاري"
              />
              <BilingualField labelFr="Adresse postale" labelAr="العنوان البريدي" textarea />
              <BilingualField labelFr="N° du téléphone" labelAr="رقم الهاتف" />
              <BilingualField labelFr="N° du Fax" labelAr="رقم الفاكس" />
              <BilingualField labelFr="E-mail @" labelAr="@ البريد الالكتروني" />
            </div>
          </div>

          <div className="bg-card rounded-md shadow-sm border border-border p-6 mb-6">
            {/* Section B - Auteur(s) */}
            <SectionHeader left="Auteur(s)" right="المؤلف(ين)" />

            <div className="space-y-3 mt-4">
              {authors.map((author, index) => (
                <input
                  key={index}
                  type="text"
                  value={author}
                  // onChange={(e) => updateAuthor(index, e.target.value)}
                  placeholder={`Auteur ${index + 1}`}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ))}
              <button
                type="button"
                onClick={addAuthor}
                className="text-sm text-primary font-medium hover:underline"
              >
                + Ajouter un auteur
              </button>
            </div>
          </div>

          <div className="bg-card rounded-md shadow-sm border border-border p-6 mb-6">
            {/* Section C - L'œuvre */}
            <SectionHeader left="L'œuvre" right="المصنف" />

            <div className="space-y-4 mt-4">
              <BilingualField labelFr="Titre" labelAr="العنوان" />
              <BilingualField
                labelFr="Description sommaire du contenu de l'œuvre"
                labelAr="وصف مختصر لمحتوى المصنف"
                textarea
              />
              <BilingualField labelFr="Genre n°" labelAr="النوع/رقم" />
              <BilingualField labelFr="Support" labelAr="الحاملة" />
            </div>
          </div>

          {/* Validation */}
          <div className="flex justify-end mb-6">
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-md px-8 py-2 text-sm font-medium hover:opacity-90 transition-opacity border border-primary"
            >
              Valider
            </button>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm font-medium text-foreground whitespace-nowrap">
                Référence facture :
              </label>
              <input
                type="text"
                value={referenceFacture}
                onChange={(e) => setReferenceFacture(e.target.value)}
                className="border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
              />
            </div>
            <button
              type="button"
              className="text-sm text-primary underline hover:no-underline"
            >
              Imprimer certificat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
{/* interface will be added to types latr */}
interface SectionHeaderProps {
  left: string;
  right: string;
}
const SectionHeader = ({ left, right }:SectionHeaderProps) => (
  <div className="flex justify-between items-center border-b border-border pb-2">
    <h2 className="text-lg font-semibold text-foreground underline">{left}</h2>
    <h2 className="text-lg font-semibold text-foreground" dir="rtl">
      {right}
    </h2>
  </div>
);
{/* interface will be added to types latr */}
interface BilingualFieldProps {
  labelFr: string;
  labelAr: string;
  textarea?: boolean;
}
const BilingualField = ({ labelFr, labelAr, textarea = false }:BilingualFieldProps) => (
  <div className="grid grid-cols-[1fr_2fr_1fr] items-start gap-4">
    <label className="text-sm text-foreground text-right pt-2">{labelFr} :</label>
    {textarea ? (
      <textarea
        rows={3}
        className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
    ) : (
      <input
        type="text"
        className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    )}
    <label className="text-sm text-foreground text-left pt-2" dir="rtl">
      {labelAr}
    </label>
  </div>
);

export default DepositPage;