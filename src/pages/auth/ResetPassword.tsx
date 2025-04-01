import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`
      });

      if (error) throw error;

      toast.success(t("auth.resetPassword.success"));
      setCooldown(8); // Set 8 second cooldown
      navigate("/reset-password/sent", { replace: true });
    } catch (error) {
      console.error("Error sending reset link:", error);
      toast.error(t("auth.resetPassword.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.resetPassword.title")}</h1>
        <p className="text-gray-600 mb-6 text-center">
          {t("auth.resetPassword.description")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value={t("auth.resetPassword.email")} />
            </div>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t("auth.resetPassword.enterEmail")}
              autoComplete="email"
              disabled={cooldown > 0}
            />
          </div>

          <Button
            type="submit"
            color="blue"
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            disabled={loading || cooldown > 0}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t("common.loading")}
              </>
            ) : cooldown > 0 ? (
              t("auth.resetPassword.wait", { seconds: cooldown })
            ) : (
              t("auth.resetPassword.submit")
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 