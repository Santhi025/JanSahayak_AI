export interface NormalizedScheme {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string;
  required_documents: string[];
  application_link: string | null;
  tags: string[];
  target_gender: string;
  target_occupations: string[];
  min_age: number | null;
  max_age: number | null;
  income_limit: number | null;
  is_student_only: boolean;
  is_farmer_only: boolean;
  is_pregnant_only: boolean;
  is_senior_only: boolean;
  is_daily_wage_only: boolean;
  is_bpl_only: boolean;
  central_or_state: string;
  applicable_states: string[];
  offline_process?: string | null;
  nearest_office?: string | null;
}

export function parseMySchemeData(raw: any): NormalizedScheme {
  return {
    id: raw.id || raw.slug || '',
    name: raw.name || raw.schemeName || '',
    category: raw.category || raw.schemeCategory || 'General',
    description: raw.description || raw.schemeDescription || '',
    benefits: raw.benefits || raw.benefitsDescription || '',
    required_documents: Array.isArray(raw.required_documents) 
      ? raw.required_documents 
      : (raw.requiredDocuments ? raw.requiredDocuments.split(',').map((d: string) => d.trim()) : []),
    application_link: raw.application_link || raw.applicationLink || null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    target_gender: raw.target_gender || raw.targetGender || 'All',
    target_occupations: Array.isArray(raw.target_occupations) 
      ? raw.target_occupations 
      : (raw.targetOccupations ? raw.targetOccupations.split(',').map((o: string) => o.trim()) : ['All']),
    min_age: raw.min_age !== undefined && raw.min_age !== null ? parseInt(raw.min_age, 10) : (raw.minAge ? parseInt(raw.minAge, 10) : null),
    max_age: raw.max_age !== undefined && raw.max_age !== null ? parseInt(raw.max_age, 10) : (raw.maxAge ? parseInt(raw.maxAge, 10) : null),
    income_limit: raw.income_limit !== undefined && raw.income_limit !== null ? parseFloat(raw.income_limit) : (raw.incomeLimit ? parseFloat(raw.incomeLimit) : null),
    is_student_only: !!(raw.is_student_only ?? raw.isStudentOnly),
    is_farmer_only: !!(raw.is_farmer_only ?? raw.isFarmerOnly),
    is_pregnant_only: !!(raw.is_pregnant_only ?? raw.isPregnantOnly),
    is_senior_only: !!(raw.is_senior_only ?? raw.isSeniorOnly),
    is_daily_wage_only: !!(raw.is_daily_wage_only ?? raw.isDailyWageOnly),
    is_bpl_only: !!(raw.is_bpl_only ?? raw.isBplOnly),
    central_or_state: raw.central_or_state || raw.centralOrState || 'Central',
    applicable_states: Array.isArray(raw.applicable_states) 
      ? raw.applicable_states 
      : (raw.applicableStates ? raw.applicableStates.split(',').map((s: string) => s.trim()) : ['All']),
    offline_process: raw.offline_process || null,
    nearest_office: raw.nearest_office || null,
  };
}
