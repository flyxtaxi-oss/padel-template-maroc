"use client";

import { useState, useEffect, useRef, use } from 'react';
import { Star, CheckCircle2, ArrowLeft, Send, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { getDictionary } from '@/i18n/dictionaries';
import clubConfig from '@/config/club.config';
import { getGoogleReviewUrl } from '@/lib/reviewUrl';
import { saveFeedback } from '@/lib/demoStore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AvisPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale || 'fr';
  const isRtl = locale === 'ar';
  const t = getDictionary(locale);

  // States
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  // Garde de non-relance : un ref, pas un state — la redirection ne doit rien
  // réafficher, et un setState synchrone dans un effet provoque un rendu en
  // cascade (règle react-hooks/set-state-in-effect).
  const redirectStarted = useRef(false);

  // Redirection automatique vers Google pour les avis positifs (4 & 5 étoiles).
  useEffect(() => {
    if (rating < 4 || redirectStarted.current) return;
    redirectStarted.current = true;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = getGoogleReviewUrl();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rating]);

  // Handle negative/neutral feedback submit (1, 2, or 3 stars)
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    const feedbackData = {
      id: `fb_${Date.now()}`,
      rating,
      comment,
      name: name.trim() || 'Anonyme',
      phone: phone.trim() || 'Non renseigné',
      created_at: new Date().toISOString(),
      club_slug: clubConfig.slug,
    };

    try {
      // 1. Save locally for demo store persistence
      saveFeedback(feedbackData);

      // 2. Save in Firestore if configured
      if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        // Import dynamique : voir BookingWidget — Firestore ne se charge qu'à l'envoi.
        const [{ db }, { collection, addDoc }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/firestore'),
        ]);
        await addDoc(collection(db, 'feedbacks'), {
          rating: feedbackData.rating,
          comment: feedbackData.comment,
          name: feedbackData.name,
          phone: feedbackData.phone,
          created_at: feedbackData.created_at,
          club_slug: feedbackData.club_slug,
        });
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleManualGoogleRedirect = () => {
    window.location.href = getGoogleReviewUrl();
  };

  return (
    <div className="min-h-screen bg-sand text-foreground flex flex-col justify-between">
      {/* Mini-Header */}
      <header className="border-b border-[#1e1b14]/10 bg-cream/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold font-display text-base font-semibold text-[#1a140a]">
              G
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              Golden <span className="text-gold">Padel</span>
            </span>
          </Link>
          
          <Link 
            href={`/${locale}`} 
            className="btn-outline px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <ArrowLeft className={`h-3 w-3 ${isRtl ? 'rotate-180' : ''}`} />
            {locale === 'fr' ? 'Retour' : locale === 'ar' ? 'الرجوع' : locale === 'es' ? 'Volver' : 'Back'}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {rating === 0 ? (
              /* Etape 1: Selection de la note */
              <motion.div
                key="step-stars"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="card card-lift bg-white p-8 border border-gray-100 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                  <MessageSquare className="h-6 w-6 text-gold" />
                </div>
                
                <h1 className="font-display text-3xl font-bold t-title leading-tight">
                  {t.review?.title || 'Votre avis compte'}
                </h1>
                <p className="mt-2 text-sm t-muted">
                  {t.review?.subtitle || 'Aidez-nous à nous améliorer ou partagez votre expérience.'}
                </p>

                <div className="mt-8 border-t hair pt-6">
                  <p className="text-sm font-medium t-soft mb-6">
                    {t.review?.starsPrompt || 'Quelle note donneriez-vous à votre expérience au Golden Padel Club ?'}
                  </p>
                  
                  {/* Star Widget */}
                  <div className="flex items-center justify-center gap-2.5" style={{ direction: 'ltr' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform active:scale-125 duration-100 cursor-pointer"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-9 w-9 transition-colors duration-200 ${
                            star <= (hoverRating || rating)
                              ? 'fill-gold text-gold filter drop-shadow-[0_0_6px_rgba(185,138,46,0.3)]'
                              : 'text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : rating >= 4 ? (
              /* Etape 2 (Positive): Gating vers Google */
              <motion.div
                key="step-positive"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="panel-court card-lift rounded-[1.15rem] p-8 text-center border-none relative overflow-hidden"
              >
                <div className="absolute inset-0 court-lines opacity-10 pointer-events-none" />
                
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 relative z-10 animate-bounce">
                  <Sparkles className="h-8 w-8 text-gold" />
                </div>
                
                <h2 className="font-display text-3xl font-bold t-title leading-tight relative z-10">
                  {t.review?.positiveTitle || 'Merci pour votre soutien !'}
                </h2>
                <p className="mt-4 text-sm t-soft leading-relaxed relative z-10 px-2">
                  {t.review?.positiveSubtitle || 'Nous sommes ravis que vous ayez apprécié votre expérience. Aidez-nous à nous faire connaître en partageant votre avis sur Google !'}
                </p>

                <div className="mt-8 border-t hair pt-6 relative z-10">
                  <button
                    onClick={handleManualGoogleRedirect}
                    className="btn-gold w-full py-4 text-sm font-bold flex items-center justify-center gap-2 group shadow-lg cursor-pointer"
                  >
                    {t.review?.googleButton || 'Laisser un avis sur Google'}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  
                  <p className="mt-4 text-xs t-muted flex items-center justify-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-gold animate-ping" />
                    {t.review?.redirecting || 'Vous allez être redirigé vers Google...'} ({countdown}s)
                  </p>
                </div>
              </motion.div>
            ) : !isSubmitted ? (
              /* Etape 2 (Négative): Formulaire de feedback interne */
              <motion.div
                key="step-negative"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card card-lift bg-white p-8 border border-gray-100"
              >
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="flex items-center gap-1 text-xs t-muted hover:text-foreground mb-4 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {locale === 'fr' ? 'Modifier la note' : locale === 'ar' ? 'تعديل التقييم' : 'Change rating'}
                </button>

                <h2 className="font-display text-2xl font-bold t-title leading-tight">
                  {t.review?.negativeTitle || 'Votre avis nous intéresse'}
                </h2>
                <p className="mt-2 text-sm t-muted leading-relaxed">
                  {t.review?.negativeSubtitle || "Nous sommes désolés que votre expérience n'ait pas été parfaite. Dites-nous comment nous pouvons nous améliorer :"}
                </p>

                <form onSubmit={handleSubmitFeedback} className="mt-6 space-y-4">
                  <div>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t.review?.commentPlaceholder || 'Saisissez vos remarques ou suggestions...'}
                      rows={4}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm text-foreground outline-none transition-colors placeholder-gray-400 focus:border-gold focus:bg-white focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        {locale === 'fr' ? 'Votre nom (optionnel)' : locale === 'ar' ? 'الاسم (اختياري)' : 'Name (optional)'}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Ahmed"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-foreground outline-none focus:border-gold focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        {locale === 'fr' ? 'Téléphone (optionnel)' : locale === 'ar' ? 'الهاتف (اختياري)' : 'Phone (optional)'}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 06 00 00 00 00"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-foreground outline-none focus:border-gold focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="btn-gold w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t.review?.submitFeedback || 'Envoyer mon retour'}
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* Etape 3 (Négative Succès): Confirmation de feedback enregistré */
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card card-lift bg-white p-8 border border-gray-100 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                
                <h2 className="font-display text-2xl font-bold t-title leading-tight">
                  {locale === 'fr' ? 'Merci beaucoup !' : locale === 'ar' ? 'شكراً جزيلاً!' : 'Thank you!'}
                </h2>
                
                <p className="mt-3 text-sm t-soft leading-relaxed px-2">
                  {t.review?.feedbackSuccess || 'Merci pour vos remarques ! Votre retour a été envoyé directement à la direction pour nous aider à nous améliorer.'}
                </p>

                <div className="mt-8 border-t hair pt-6">
                  <Link
                    href={`/${locale}`}
                    className="btn-outline w-full py-3 text-sm font-semibold cursor-pointer"
                  >
                    {locale === 'fr' ? 'Retourner à l\'accueil' : locale === 'ar' ? 'الرجوع للرئيسية' : 'Back to Home'}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t hair text-center text-xs t-muted px-6">
        <p>© {new Date().getFullYear()} {clubConfig.name}. {t.footer?.rights || 'Tous droits réservés.'}</p>
      </footer>
    </div>
  );
}
