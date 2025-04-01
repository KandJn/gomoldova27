import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { CheckCircle } from "lucide-react";

export function ResetPasswordSent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">{t("auth.resetPassword.sent.title")}</h1>
        <p className="text-gray-600 mb-8">
          {t("auth.resetPassword.sent.description")}
        </p>
        <Button
          color="blue"
          className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          onClick={() => navigate("/login")}
        >
          {t("auth.resetPassword.sent.backToLogin")}
        </Button>
      </div>
    </div>
  );
} 