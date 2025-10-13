'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { executeRecaptcha } from '@/lib/recaptcha-client';

const schema = z.object({
  first_name: z.string().trim().max(100).optional(),
  email: z.string().trim().min(1, 'Email jest wymagany').email('Nieprawidłowy adres email'),
  privacy_consent: z.boolean().refine(v => v === true, {
    message: 'Wymagana akceptacja Polityki prywatności/Regulaminu.',
  }),
  marketing_consent: z.boolean().refine(v => v === true, {
    message: 'Wymagana zgoda marketingowa na newsletter.',
  }),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  variant?: 'card' | 'inline';
  className?: string;
  source?: string; // e.g., 'blog_card', 'blog_post', etc.
};

function getInitialUtm(search: string | null) {
  try {
    const params = new URLSearchParams(search || '');
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    };
  } catch {
    return {};
  }
}

export default function NewsletterForm({ variant = 'card', className = '', source = 'newsletter_form' }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({
    type: 'idle',
  });

  const utm = useMemo(() => getInitialUtm(searchParams ? `?${searchParams.toString()}` : null), [searchParams]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      email: '',
      privacy_consent: false,
      marketing_consent: false,
    },
  });

  useEffect(() => {
    if (status.type === 'success') {
      // optional success side-effects
    }
  }, [status.type]);

  const onSubmit = async (values: FormValues) => {
    setStatus({ type: 'loading' });
    let token: string | undefined;
    try {
      token = await executeRecaptcha('newsletter_form');
    } catch (e) {
      // In dev environments, allow passing without token if recaptcha not configured
      if (process.env.NODE_ENV !== 'production') {
        token = undefined;
        // no-op
      } else {
        setStatus({ type: 'error', message: 'Błąd weryfikacji antybot. Odśwież stronę i spróbuj ponownie.' });
        return;
      }
    }

    // store basic consent info best-effort
    try {
      document.cookie = `user_consents_v1=${encodeURIComponent(
        JSON.stringify({
          newsletter_form: { privacy: values.privacy_consent, marketing: values.marketing_consent },
          ts: Date.now(),
          v: 1,
        }),
      )}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`;
    } catch {}

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          first_name: values.first_name,
          source,
          recaptchaToken: token,
          marketing_consent: values.marketing_consent,
          privacy_consent: values.privacy_consent,
          ...utm,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        setStatus({ type: 'error', message: data.error || 'Nie udało się zapisać. Spróbuj ponownie.' });
        return;
      }
      setStatus({ type: 'success', message: data.message || 'Dziękujemy za zapis!' });
      reset({ first_name: '', email: '', privacy_consent: false, marketing_consent: false });
    } catch {
      setStatus({ type: 'error', message: 'Wystąpił błąd sieci. Spróbuj ponownie.' });
    }
  };

  const CardWrapper: React.FC<{ children: React.ReactNode }> =
    variant === 'card'
      ? ({ children }) => (
          <div className={`rounded-2xl p-6 border-2 border-gray-200 bg-white ${className}`}>{children}</div>
        )
      : ({ children }) => <div className={className}>{children}</div>;

  return (
    <CardWrapper>
      {status.type === 'success' ? (
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">✓</div>
          <h4 className="text-xl font-bold text-gray-900">Dziękujemy za zapis!</h4>
          <p className="text-gray-600">Wkrótce otrzymasz od nas najnowsze porady i inspiracje.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formularz zapisu do newslettera">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Dołącz do newslettera</h3>
            <p className="text-gray-600 text-sm">Trendy, porady i promocje – 1–2 razy w miesiącu. Zero spamu.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imię (opcjonalnie)</label>
              <input
                type="text"
                placeholder="np. Jan"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('first_name')}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail</label>
              <input
                type="email"
                placeholder="np. jan.kowalski@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-gray-600">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-green-600">✓</span> 1–2 wiadomości/miesiąc
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-green-600">✓</span> Zero spamu
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input type="checkbox" className="mt-0.5" {...register('privacy_consent')} />
              <span>
                Akceptuję <a href="/privacy" className="underline">Politykę prywatności</a> i <a href="/terms" className="underline">Regulamin</a>.
              </span>
            </label>
            {errors.privacy_consent && <p className="text-sm text-red-600">{errors.privacy_consent.message}</p>}

            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input type="checkbox" className="mt-0.5" {...register('marketing_consent')} />
              <span>Wyrażam zgodę na otrzymywanie informacji handlowych (newsletter) drogą elektroniczną.</span>
            </label>
            {errors.marketing_consent && <p className="text-sm text-red-600">{errors.marketing_consent.message}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || status.type === 'loading'}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status.type === 'loading' ? 'Zapisywanie...' : 'Zapisz mnie'}
            </button>
            {status.type === 'error' && <span className="text-sm text-red-600">{status.message}</span>}
          </div>

          <p className="text-[11px] sm:text-xs text-gray-500">
            Twoje dane są bezpieczne. W każdej chwili możesz się wypisać jednym kliknięciem.
          </p>
        </form>
      )}
    </CardWrapper>
  );
}
