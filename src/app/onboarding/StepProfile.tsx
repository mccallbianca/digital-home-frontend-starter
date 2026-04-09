'use client';

interface ProfileData {
  firstName: string;
  lastName: string;
  preferredName: string;
  pronouns: string;
  timezone: string;
}

const PRONOUNS_OPTIONS = [
  '',
  'He/Him',
  'She/Her',
  'They/Them',
  'He/They',
  'She/They',
  'Ze/Zir',
  'Prefer not to say',
];

const TIMEZONES = Intl.supportedValuesOf('timeZone');

export default function StepProfile({
  data,
  onChange,
}: {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}) {
  function update(field: keyof ProfileData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl font-light text-[var(--herr-white)] mb-3">
        Tell us about yourself.
      </h2>
      <p className="text-[var(--herr-muted)] mb-10 leading-relaxed">
        This information personalizes your HERR experience.
      </p>

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="herr-label text-[var(--herr-muted)] block mb-2">
              First Name <span className="text-[var(--herr-pink)]">*</span>
            </label>
            <input
              type="text"
              required
              value={data.firstName}
              onChange={e => update('firstName', e.target.value)}
              className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors"
            />
          </div>
          <div>
            <label className="herr-label text-[var(--herr-muted)] block mb-2">
              Last Name <span className="text-[var(--herr-pink)]">*</span>
            </label>
            <input
              type="text"
              required
              value={data.lastName}
              onChange={e => update('lastName', e.target.value)}
              className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="herr-label text-[var(--herr-muted)] block mb-2">
            Preferred Name <span className="text-[var(--herr-faint)]">(optional)</span>
          </label>
          <input
            type="text"
            value={data.preferredName}
            onChange={e => update('preferredName', e.target.value)}
            placeholder="What should we call you?"
            className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors"
          />
        </div>

        <div>
          <label className="herr-label text-[var(--herr-muted)] block mb-2">
            Pronouns <span className="text-[var(--herr-faint)]">(optional)</span>
          </label>
          <select
            value={data.pronouns}
            onChange={e => update('pronouns', e.target.value)}
            className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors"
          >
            <option value="">Select pronouns</option>
            {PRONOUNS_OPTIONS.filter(Boolean).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="herr-label text-[var(--herr-muted)] block mb-2">
            Time Zone <span className="text-[var(--herr-pink)]">*</span>
          </label>
          <select
            value={data.timezone}
            onChange={e => update('timezone', e.target.value)}
            className="w-full bg-[var(--herr-surface)] border border-[var(--herr-border)] text-[var(--herr-white)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--herr-cobalt)] transition-colors"
          >
            <option value="">Select time zone</option>
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
