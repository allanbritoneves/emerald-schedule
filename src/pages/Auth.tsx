import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, UserPlus, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Bem-vindo de volta!");
                navigate("/");
            } else {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (authError) throw authError;

                // If user is created, also create a client record
                if (authData.user) {
                    const { error: clientError } = await supabase.from("clients").insert([
                        {
                            name: fullName,
                            email: email,
                            user_id: authData.user.id,
                        },
                    ]);
                    if (clientError) console.error("Error creating client profile:", clientError);
                }

                toast.success("Conta criada! Verifique seu e-mail.");
                setIsLogin(true);
            }
        } catch (error: any) {
            toast.error(error.message || "Ocorreu um erro na autenticação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden p-4">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                        <Sparkles className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">
                        Schedula
                    </h1>
                    <p className="text-slate-400 font-medium">
                        {isLogin ? "Sua agenda inteligente espera por você" : "Comece sua jornada hoje"}
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    <form onSubmit={handleAuth} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <Label className="text-slate-300 text-sm ml-1" htmlFor="name">Nome Completo</Label>
                                    <div className="relative">
                                        <UserPlus className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="name"
                                            placeholder="Como podemos te chamar?"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="bg-slate-950/50 border-white/5 pl-10 h-11 focus:border-emerald-500/50 transition-all text-white"
                                            disabled={loading}
                                            required={!isLogin}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <Label className="text-slate-300 text-sm ml-1" htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-950/50 border-white/5 pl-10 h-11 focus:border-emerald-500/50 transition-all text-white"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <Label className="text-slate-300 text-sm" htmlFor="password">Senha</Label>
                                {isLogin && (
                                    <button type="button" className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors">
                                        Esqueceu?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-950/50 border-white/5 pl-10 h-11 focus:border-emerald-500/50 transition-all text-white"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] group mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processando...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>{isLogin ? "Entrar" : "Criar Conta Livre"}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-400 text-sm">
                            {isLogin ? "Não tem uma conta?" : "Já possui cadastro?"}{" "}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors ml-1"
                                disabled={loading}
                            >
                                {isLogin ? "Começar Agora" : "Fazer Login"}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-600 text-xs">
                    Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
