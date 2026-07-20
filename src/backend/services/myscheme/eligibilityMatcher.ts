import { NormalizedScheme } from './schemeParser';

export interface Profile {
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  state?: string | null;
  income?: number | null;
  pregnant?: boolean | null;
  farmer?: boolean | null;
  student?: boolean | null;
  seniorCitizen?: boolean | null;
  dailyWageWorker?: boolean | null;
  bpl?: boolean | null;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export function checkEligibility(scheme: NormalizedScheme, profile: Profile): EligibilityResult {
  const reasons: string[] = [];
  let isEligible = true;

  // Rule: Gender
  if (scheme.target_gender !== 'All') {
    if (!profile.gender || profile.gender.toLowerCase() !== scheme.target_gender.toLowerCase()) {
      isEligible = false;
    } else {
      reasons.push(`matches your gender (${profile.gender})`);
    }
  }

  // Rule: State
  if (!scheme.applicable_states.includes('All') && scheme.applicable_states.length > 0) {
    if (!profile.state || !scheme.applicable_states.some((s: string) => s.toLowerCase() === profile.state!.toLowerCase())) {
      isEligible = false;
    } else {
      reasons.push(`is applicable in your state (${profile.state})`);
    }
  }

  // Rule: Occupations / Statuses
  if (scheme.is_farmer_only && profile.occupation?.toLowerCase() !== 'farmer' && profile.farmer !== true) {
    isEligible = false;
  } else if (scheme.is_farmer_only) {
    reasons.push('is designed for farmers');
  }

  if (scheme.is_student_only && profile.occupation?.toLowerCase() !== 'student' && profile.student !== true) {
    isEligible = false;
  } else if (scheme.is_student_only) {
    reasons.push('supports students');
  }

  if (scheme.is_pregnant_only && profile.pregnant !== true) {
    isEligible = false;
  } else if (scheme.is_pregnant_only) {
    reasons.push('supports pregnant women');
  }

  if (scheme.is_daily_wage_only && profile.occupation?.toLowerCase() !== 'daily wage labourer' && profile.dailyWageWorker !== true) {
    isEligible = false;
  } else if (scheme.is_daily_wage_only) {
    reasons.push('supports daily wage labourers');
  }

  // Rule: Age
  if (profile.age !== undefined && profile.age !== null) {
    if (scheme.min_age && profile.age < scheme.min_age) isEligible = false;
    if (scheme.max_age && profile.age > scheme.max_age) isEligible = false;
    if (isEligible && (scheme.min_age || scheme.max_age)) {
      reasons.push('fits your age bracket');
    }
  } else if (scheme.is_senior_only && profile.seniorCitizen !== true) {
    isEligible = false;
  } else if (scheme.is_senior_only) {
    reasons.push('is for senior citizens');
  }

  // Rule: Income limit
  if (profile.income !== undefined && profile.income !== null && scheme.income_limit !== null) {
    if (profile.income > scheme.income_limit) {
      isEligible = false;
    } else {
      reasons.push(`income is within limits (limit: ₹${scheme.income_limit})`);
    }
  }

  // Rule: BPL Card
  if (scheme.is_bpl_only && profile.bpl !== true) {
    isEligible = false;
  } else if (scheme.is_bpl_only) {
    reasons.push('is designated for BPL families');
  }

  return {
    isEligible,
    reasons,
  };
}
