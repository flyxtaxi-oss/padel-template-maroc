"use client";

import { useState, useEffect, use } from 'react';
import { Star, CheckCircle2, ArrowLeft, Send, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { getDictionary } from '@/i18n/dictionaries';
import clubConfig from '@/config/club.config';
import { getGoogleReviewUrl } from '@/lib/reviewUrl';
import { saveFeedback } from '@/lib/demoStore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import LogoMark from '@/components/LogoMark';

/**
 * Textes du choix « publier sur Google » / « écrire au club », dans les quatre
 * langues du site. Ils doivent avoir le même poids visuel et le même ton :
 * c'est ce qui distingue une alternative offerte d'un aiguillage déguisé.
 */
const CHOICE_COPY: Record<string, {
  lowTitle: string;
  lowSubtitle: string;
  privateLink: string;
  alsoGoogle: string;
  publishNow: string;
}> = {
  fr: {
    lowTitle: 'Merci pour votre franchise',
    lowSubtitle: 'Votre avis aide les autres joueurs et nous aide à progresser. Publiez-le sur Google, ou écrivez directement au club si vous préférez en parler en privé.',
    privateLink: 'Je préfère écrire au club en privé',
    alsoGoogle: 'Publier aussi mon avis sur Google',
    publishNow: 'Publier maintenant',
  },
  en: {
    lowTitle: 'Thank you for your honesty',
    lowSubtitle: 'Your review helps other players and helps us improve. Publish it on Google, or write to the club directly if you would rather discuss it privately.',
    privateLink: 'I would rather write to the club privately',
    alsoGoogle: 'Also publish my review on Google',
    publishNow: 'Publish now',
  },
  es: {
    lowTitle: 'Gracias por tu sinceridad',
    lowSubtitle: 'Tu opinión ayuda a otros jugadores y nos ayuda a mejorar. Publícala en Google, o escribe directamente al club si prefieres comentarlo en privado.',
    privateLink: 'Prefiero escribir al club en privado',
    alsoGoogle: 'Publicar también mi opinión en Google',
    publishNow: 'Publicar ahora',
  },
  ar: {
    lowTitle: 'شكرًا على صراحتك',
    lowSubtitle: 'رأيك يساعد اللاعبين الآخرين ويساعدنا على التحسّن. انشره على Google، أو راسل النادي مباشرة إن كنت تفضّل الحديث بشكل خاص.',
    privateLink: 'أفضّل مراسلة النادي بشكل خاص',
    alsoGoogle: 'انشر رأيي على Google أيضًا',
    publishNow: 'انشر الآن',
  },
};

export default function AvisPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale || 'fr';
  const isRtl = locale === 'ar';
  const t = getDictionary(locale);
  const C = CHOICE_COPY[locale] || CHOICE_COPY.fr;

  // States
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  // Le visiteur a choisi d'écrire au club plutôt que de publier sur Google.
  // C'est SON choix, pas un filtre appliqué à sa note : voir le commentaire
  // sur la redirection ci-dessous.
  const [privateMode, setPrivateMode] = useState<boolean>(false);

  /**
   * Redirection vers Google — pour TOUTES les notes, pas seulement les bonnes.
   *
   * La version précédente n'envoyait vers Google que les 4 et 5 étoiles, et
   * dirigeait les 1–3 vers un formulaire privé sans jamais leur proposer de
   * publier. Cette pratique porte un nom, « review gating », et Google
   * l'interdit explicitement : sanctions constatées, la suppression de *tous*
   * les avis de l'établissement, la perte de classement, voire la suspension
   * de la fiche. Pour un club dont la visibilité locale repose entièrement sur
   * sa fiche Google, c'est un risque disproportionné.
   *
   * Ici, tout le monde reçoit la même proposition, et chacun garde le choix :
   * un lien aussi visible permet d'écrire au club en privé au lieu de publier.
   * Le levier de conversion — demander au bon moment, en un scan, avec un lien
   * direct vers le formulaire — est intact ; seul le tri disparaît.
   */
  useEffect(() => {
    // `privateMode` fait partie des dépendances : passer en écriture privée
    // doit réellement arrêter le compte à rebours. Sans cela, le visiteur
    // cliquait « écrire au club » et se retrouvait quand même expédié sur
    // Google deux secondes plus tard.
    if (rating === 0 || privateMode) return;

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
  }, [rating, privateMode]);

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
            {/* Même monogramme SVG que l'en-tête du site : la page avis est
                ouverte depuis le QR du club, c'est souvent le premier contact
                avec la marque. */}
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-lg font-semibold text-foreground">
              Golden <span className="t-gold">Padel</span>
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
            ) : isSubmitted ? (
              /* Etape 3 : retour privé enregistré — le lien Google reste offert,
                 pour ne fermer aucune porte à quelqu'un qui vient de s'exprimer. */
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
                  {locale === 'fr' ? 'Merci beaucoup !' : locale === 'ar' ? 'شكراً جزيلاً!' : locale === 'es' ? '¡Muchas gracias!' : 'Thank you!'}
                </h2>

                <p className="mt-3 text-sm t-soft leading-relaxed px-2">
                  {t.review?.feedbackSuccess || 'Merci pour vos remarques ! Votre retour a été envoyé directement à la direction pour nous aider à nous améliorer.'}
                </p>

                <div className="mt-8 border-t hair pt-6 space-y-3">
                  <button
                    onClick={handleManualGoogleRedirect}
                    className="btn-gold w-full py-3 text-sm font-bold cursor-pointer"
                  >
                    {C.alsoGoogle}
                  </button>
                  <Link
                    href={`/${locale}`}
                    className="btn-outline w-full py-3 text-sm font-semibold cursor-pointer"
                  >
                    {locale === 'fr' ? 'Retourner à l\'accueil' : locale === 'ar' ? 'الرجوع للرئيسية' : locale === 'es' ? 'Volver al inicio' : 'Back to Home'}
                  </Link>
                </div>
              </motion.div>
            ) : !privateMode ? (
              /* Etape 2 : proposition de publier sur Google — identique pour
                 toutes les notes. Seul le ton du texte suit la note ; l'offre,
                 elle, est la même pour tout le monde. */
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
                  {rating >= 4 ? (t.review?.positiveTitle || 'Merci pour votre soutien !') : C.lowTitle}
                </h2>
                <p className="mt-4 text-sm t-soft leading-relaxed relative z-10 px-2">
                  {rating >= 4
                    ? (t.review?.positiveSubtitle || 'Nous sommes ravis que vous ayez apprécié votre expérience. Aidez-nous à nous faire connaître en partageant votre avis sur Google !')
                    : C.lowSubtitle}
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

                  {/* Alternative, offerte à tout le monde et au même endroit,
                      quelle que soit la note. Elle arrête le compte à rebours. */}
                  <button
                    type="button"
                    onClick={() => setPrivateMode(true)}
                    className="mt-5 w-full text-xs t-soft underline underline-offset-4 hover:t-title transition-colors cursor-pointer"
                  >
                    {C.privateLink}
                  </button>
                </div>
              </motion.div>
            ) : (
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
                  onClick={() => { setRating(0); setPrivateMode(false); setCountdown(3); }}
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
