import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-hot-toast";

export function ResetPasswordConfirm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for error in the URL hash
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error) {
      console.error("Error in URL:", error, errorDescription);
      toast.error(t("auth.resetPasswordConfirm.invalidToken"));
      navigate("/login");
      return;
    }

    // Check if we have a valid session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error("No valid session:", error);
        toast.error(t("auth.resetPasswordConfirm.invalidToken"));
        navigate("/login");
        return;
      }
    };

    checkSession();
  }, [navigate, t, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error(t("auth.resetPasswordConfirm.passwordsDoNotMatch"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error(t("auth.resetPasswordConfirm.passwordTooShort"));
      setLoading(false);
      return;
    }

    try {
      // Update the password using the current session
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        if (error.message.includes("New password should be different from the old password")) {
          toast.error(t("auth.resetPasswordConfirm.samePassword"));
          setLoading(false);
          return;
        }
        throw error;
      }

      toast.success(t("auth.resetPasswordConfirm.success"));
      // Sign out after successful password update
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.message.includes("New password should be different from the old password")) {
        toast.error(t("auth.resetPasswordConfirm.samePassword"));
      } else {
        toast.error(t("auth.resetPasswordConfirm.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.resetPasswordConfirm.title")}</h1>
        <p className="text-gray-600 mb-6 text-center">
          {t("auth.resetPasswordConfirm.description")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value={t("auth.resetPasswordConfirm.newPassword")} />
            </div>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t("auth.resetPasswordConfirm.enterNewPassword")}
              autoComplete="new-password"
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword" value={t("auth.resetPasswordConfirm.confirmPassword")} />
            </div>
            <TextInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={t("auth.resetPasswordConfirm.confirmPassword")}
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            color="blue"
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t("common.loading")}
              </>
            ) : (
              t("auth.resetPasswordConfirm.submit")
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 