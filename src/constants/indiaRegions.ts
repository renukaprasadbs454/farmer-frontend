/**
 * India region hierarchy: State → District → Taluk → Hobli → Village
 * Focused on Karnataka (primary) + major farming states
 */

export interface HobliData {
  name: string;
  villages: string[];
}

export interface TalukData {
  name: string;
  hoblis: HobliData[];
}

export interface DistrictData {
  name: string;
  taluks: TalukData[];
}

export interface StateData {
  name: string;
  districts: DistrictData[];
}

export const INDIA_REGIONS: StateData[] = [
  {
    name: 'Karnataka',
    districts: [
      {
        name: 'Mandya',
        taluks: [
          {
            name: 'Mandya',
            hoblis: [
              { name: 'Mandya', villages: ['Mandya', 'Bellur', 'Hosaholalu', 'Maddur Road', 'Nagamangala Road'] },
              { name: 'Maddur', villages: ['Maddur', 'Shivapura', 'Kokkarne', 'Hanakere', 'Badaranahalli'] },
            ],
          },
          {
            name: 'Maddur',
            hoblis: [
              { name: 'Maddur', villages: ['Maddur Town', 'Melukote', 'Huliyurdurga', 'Ramanathapura', 'Thonnur'] },
              { name: 'Koppa', villages: ['Koppa', 'Shivapura', 'Mahadevapura', 'Chikkabidare'] },
            ],
          },
          {
            name: 'Srirangapatna',
            hoblis: [
              { name: 'Srirangapatna', villages: ['Srirangapatna', 'Ganjam', 'Bannur', 'Tenginakoppal'] },
              { name: 'Torehalli', villages: ['Torehalli', 'Halagur', 'Bidaragere', 'Nagamangala'] },
            ],
          },
          {
            name: 'Malavalli',
            hoblis: [
              { name: 'Malavalli', villages: ['Malavalli', 'Sivasamudram', 'Hogare', 'Aralumallige'] },
              { name: 'Kollegal', villages: ['Kollegal', 'Muguru', 'Kowdalli', 'Galipura'] },
            ],
          },
          {
            name: 'Pandavapura',
            hoblis: [
              { name: 'Pandavapura', villages: ['Pandavapura', 'Basaralu', 'Melkote', 'Kalyani'] },
            ],
          },
          {
            name: 'Krishnarajapet',
            hoblis: [
              { name: 'Krishnarajapet', villages: ['Krishnarajapet', 'Nagamangala', 'Belagi', 'Hirekyathanahalli'] },
            ],
          },
          {
            name: 'Nagamangala',
            hoblis: [
              { name: 'Nagamangala', villages: ['Nagamangala', 'Chikkanayakanahalli', 'Doddaballapur', 'Kunigal'] },
            ],
          },
        ],
      },
      {
        name: 'Mysuru',
        taluks: [
          {
            name: 'Mysuru',
            hoblis: [
              { name: 'Kasaba', villages: ['Mysuru City', 'Vijayanagar', 'Hebbal', 'Kuvempunagar'] },
              { name: 'Jayapura', villages: ['Jayapura', 'T Narasipur', 'Bannur', 'Bogadi'] },
            ],
          },
          {
            name: 'Hunsur',
            hoblis: [
              { name: 'Hunsur', villages: ['Hunsur', 'Sargur', 'Piriyapatna', 'Kenchanahalli'] },
              { name: 'Virarajendrapet', villages: ['Virarajendrapet', 'Kutta', 'Gonikoppal', 'Kushalnagar'] },
            ],
          },
          {
            name: 'Nanjangud',
            hoblis: [
              { name: 'Nanjangud', villages: ['Nanjangud', 'Gundlupet', 'Chamarajanagar', 'Yelandur'] },
              { name: 'Hedatale', villages: ['Hedatale', 'Kowtal', 'Basavanapura', 'Doddanahalli'] },
            ],
          },
          {
            name: 'H D Kote',
            hoblis: [
              { name: 'H D Kote', villages: ['H D Kote', 'Antharasante', 'Basavana Bagewadi', 'Hangala'] },
            ],
          },
          {
            name: 'K R Nagar',
            hoblis: [
              { name: 'K R Nagar', villages: ['K R Nagar', 'Hunsur Road', 'Arakere', 'Bidadi'] },
            ],
          },
          {
            name: 'T Narasipur',
            hoblis: [
              { name: 'T Narasipur', villages: ['T Narasipur', 'Talakad', 'Somanathapura', 'Bannur'] },
            ],
          },
        ],
      },
      {
        name: 'Hassan',
        taluks: [
          {
            name: 'Hassan',
            hoblis: [
              { name: 'Hassan', villages: ['Hassan', 'Shanthigrama', 'Sakleshpur', 'Belur'] },
              { name: 'Alur', villages: ['Alur', 'Arakalgud', 'Channarayapatna', 'Holenarasipur'] },
            ],
          },
          {
            name: 'Belur',
            hoblis: [
              { name: 'Belur', villages: ['Belur', 'Halebidu', 'Turuvekere', 'Tiptur'] },
            ],
          },
          {
            name: 'Sakleshpur',
            hoblis: [
              { name: 'Sakleshpur', villages: ['Sakleshpur', 'Manjarabad', 'Bisle', 'Hanbal'] },
            ],
          },
          {
            name: 'Channarayapatna',
            hoblis: [
              { name: 'Channarayapatna', villages: ['Channarayapatna', 'Shravanabelagola', 'Javagal', 'Kattaya'] },
            ],
          },
          {
            name: 'Holenarasipur',
            hoblis: [
              { name: 'Holenarasipur', villages: ['Holenarasipur', 'Arkalgud', 'Dudda', 'Malekallu'] },
            ],
          },
        ],
      },
      {
        name: 'Tumakuru',
        taluks: [
          {
            name: 'Tumakuru',
            hoblis: [
              { name: 'Tumakuru', villages: ['Tumakuru', 'Kyatsandra', 'Hebbur', 'Dobbaspete'] },
              { name: 'Pavagada', villages: ['Pavagada', 'Madhugiri', 'Koratagere', 'Chiknayakanhalli'] },
            ],
          },
          {
            name: 'Tiptur',
            hoblis: [
              { name: 'Tiptur', villages: ['Tiptur', 'Turuvekere', 'Kunigal', 'Gubbi'] },
            ],
          },
          {
            name: 'Kunigal',
            hoblis: [
              { name: 'Kunigal', villages: ['Kunigal', 'Yediyur', 'Hebbur', 'Nonavinakere'] },
            ],
          },
        ],
      },
      {
        name: 'Belagavi',
        taluks: [
          {
            name: 'Belagavi',
            hoblis: [
              { name: 'Belagavi', villages: ['Belagavi', 'Kangrali', 'Gokak', 'Chikkodi'] },
              { name: 'Raibag', villages: ['Raibag', 'Mudalagi', 'Yamakanamardi', 'Khanapur'] },
            ],
          },
          {
            name: 'Gokak',
            hoblis: [
              { name: 'Gokak', villages: ['Gokak', 'Mudalagi', 'Soundatti', 'Raibag'] },
            ],
          },
          {
            name: 'Chikkodi',
            hoblis: [
              { name: 'Chikkodi', villages: ['Chikkodi', 'Athani', 'Kagwad', 'Nippani'] },
            ],
          },
        ],
      },
      {
        name: 'Dharwad',
        taluks: [
          {
            name: 'Dharwad',
            hoblis: [
              { name: 'Dharwad', villages: ['Dharwad', 'Hubli', 'Alnavar', 'Kalghatgi'] },
              { name: 'Kundgol', villages: ['Kundgol', 'Navalgund', 'Annigeri', 'Hangal'] },
            ],
          },
          {
            name: 'Hubli',
            hoblis: [
              { name: 'Hubli', villages: ['Hubli', 'Unkal', 'Gabbur', 'Tarihal'] },
            ],
          },
        ],
      },
      {
        name: 'Bengaluru Rural',
        taluks: [
          {
            name: 'Doddaballapur',
            hoblis: [
              { name: 'Doddaballapur', villages: ['Doddaballapur', 'Tubugere', 'Vijayapura', 'Gauribidanur'] },
            ],
          },
          {
            name: 'Devanahalli',
            hoblis: [
              { name: 'Devanahalli', villages: ['Devanahalli', 'Nandi', 'Sulibele', 'Vijayapura'] },
            ],
          },
          {
            name: 'Hoskote',
            hoblis: [
              { name: 'Hoskote', villages: ['Hoskote', 'Malur', 'Bethamangala', 'Jadigenahalli'] },
            ],
          },
          {
            name: 'Nelamangala',
            hoblis: [
              { name: 'Nelamangala', villages: ['Nelamangala', 'Savandurga', 'Magadi', 'Ramanagara'] },
            ],
          },
        ],
      },
      {
        name: 'Kolar',
        taluks: [
          {
            name: 'Kolar',
            hoblis: [
              { name: 'Kolar', villages: ['Kolar', 'Bangarapet', 'Malur', 'Srinivaspur'] },
            ],
          },
          {
            name: 'Chikkaballapur',
            hoblis: [
              { name: 'Chikkaballapur', villages: ['Chikkaballapur', 'Gudibande', 'Bagepalli', 'Chintamani'] },
            ],
          },
        ],
      },
      {
        name: 'Shivamogga',
        taluks: [
          {
            name: 'Shivamogga',
            hoblis: [
              { name: 'Shivamogga', villages: ['Shivamogga', 'Bhadravathi', 'Sagar', 'Thirthahalli'] },
              { name: 'Bhadravathi', villages: ['Bhadravathi', 'Holehonnur', 'Anandapura', 'Ayanur'] },
            ],
          },
          {
            name: 'Sagar',
            hoblis: [
              { name: 'Sagar', villages: ['Sagar', 'Sorab', 'Shiralakoppa', 'Keladi'] },
            ],
          },
        ],
      },
      {
        name: 'Dakshina Kannada',
        taluks: [
          {
            name: 'Mangaluru',
            hoblis: [
              { name: 'Mangaluru', villages: ['Mangaluru', 'Bantwal', 'Puttur', 'Sullia'] },
            ],
          },
          {
            name: 'Bantwal',
            hoblis: [
              { name: 'Bantwal', villages: ['Bantwal', 'Uppinangady', 'Sullia', 'Belthangady'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Maharashtra',
    districts: [
      {
        name: 'Pune',
        taluks: [
          {
            name: 'Pune City',
            hoblis: [
              { name: 'Pune City', villages: ['Pune', 'Hadapsar', 'Kothrud', 'Wakad'] },
              { name: 'Haveli', villages: ['Haveli', 'Uruli Kanchan', 'Loni Kalbhor', 'Manjri'] },
            ],
          },
          {
            name: 'Baramati',
            hoblis: [
              { name: 'Baramati', villages: ['Baramati', 'Indapur', 'Phaltan', 'Daund'] },
            ],
          },
          {
            name: 'Shirur',
            hoblis: [
              { name: 'Shirur', villages: ['Shirur', 'Ranjangaon', 'Koregaon Bhima', 'Shikrapur'] },
            ],
          },
        ],
      },
      {
        name: 'Nashik',
        taluks: [
          {
            name: 'Nashik',
            hoblis: [
              { name: 'Nashik', villages: ['Nashik', 'Deolali', 'Satpur', 'Ambad'] },
            ],
          },
          {
            name: 'Niphad',
            hoblis: [
              { name: 'Niphad', villages: ['Niphad', 'Lasalgaon', 'Vinchur', 'Kundewadi'] },
            ],
          },
        ],
      },
      {
        name: 'Ahmednagar',
        taluks: [
          {
            name: 'Ahmednagar',
            hoblis: [
              { name: 'Ahmednagar', villages: ['Ahmednagar', 'Shevgaon', 'Pathardi', 'Jamkhed'] },
            ],
          },
          {
            name: 'Rahuri',
            hoblis: [
              { name: 'Rahuri', villages: ['Rahuri', 'Shrirampur', 'Kopargaon', 'Sangamner'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Andhra Pradesh',
    districts: [
      {
        name: 'Guntur',
        taluks: [
          {
            name: 'Guntur',
            hoblis: [
              { name: 'Guntur', villages: ['Guntur', 'Mangalagiri', 'Tadepalle', 'Narasaraopet'] },
            ],
          },
          {
            name: 'Tenali',
            hoblis: [
              { name: 'Tenali', villages: ['Tenali', 'Repalle', 'Bapatla', 'Chirala'] },
            ],
          },
        ],
      },
      {
        name: 'Krishna',
        taluks: [
          {
            name: 'Vijayawada',
            hoblis: [
              { name: 'Vijayawada', villages: ['Vijayawada', 'Machilipatnam', 'Gudivada', 'Nuzvid'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Tamil Nadu',
    districts: [
      {
        name: 'Coimbatore',
        taluks: [
          {
            name: 'Coimbatore North',
            hoblis: [
              { name: 'Coimbatore North', villages: ['Coimbatore', 'Tirupur', 'Erode', 'Mettupalayam'] },
            ],
          },
          {
            name: 'Pollachi',
            hoblis: [
              { name: 'Pollachi', villages: ['Pollachi', 'Udumalaipettai', 'Palladam', 'Valparai'] },
            ],
          },
        ],
      },
      {
        name: 'Salem',
        taluks: [
          {
            name: 'Salem',
            hoblis: [
              { name: 'Salem', villages: ['Salem', 'Omalur', 'Mettur', 'Yercaud'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Telangana',
    districts: [
      {
        name: 'Hyderabad',
        taluks: [
          {
            name: 'Hyderabad',
            hoblis: [
              { name: 'Hyderabad', villages: ['Hyderabad', 'Secunderabad', 'Cyberabad', 'Medchal'] },
            ],
          },
        ],
      },
      {
        name: 'Warangal',
        taluks: [
          {
            name: 'Warangal',
            hoblis: [
              { name: 'Warangal', villages: ['Warangal', 'Hanamkonda', 'Kazipet', 'Narsampet'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Punjab',
    districts: [
      {
        name: 'Ludhiana',
        taluks: [
          {
            name: 'Ludhiana',
            hoblis: [
              { name: 'Ludhiana', villages: ['Ludhiana', 'Jagraon', 'Raikot', 'Khanna'] },
            ],
          },
        ],
      },
      {
        name: 'Amritsar',
        taluks: [
          {
            name: 'Amritsar',
            hoblis: [
              { name: 'Amritsar', villages: ['Amritsar', 'Batala', 'Tarn Taran', 'Ajnala'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Haryana',
    districts: [
      {
        name: 'Karnal',
        taluks: [
          {
            name: 'Karnal',
            hoblis: [
              { name: 'Karnal', villages: ['Karnal', 'Nilokheri', 'Gharaunda', 'Assandh'] },
            ],
          },
        ],
      },
      {
        name: 'Hisar',
        taluks: [
          {
            name: 'Hisar',
            hoblis: [
              { name: 'Hisar', villages: ['Hisar', 'Hansi', 'Narnaul', 'Barwala'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Uttar Pradesh',
    districts: [
      {
        name: 'Agra',
        taluks: [
          {
            name: 'Agra',
            hoblis: [
              { name: 'Agra', villages: ['Agra', 'Firozabad', 'Mathura', 'Hathras'] },
            ],
          },
        ],
      },
      {
        name: 'Lucknow',
        taluks: [
          {
            name: 'Lucknow',
            hoblis: [
              { name: 'Lucknow', villages: ['Lucknow', 'Unnao', 'Sitapur', 'Hardoi'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Madhya Pradesh',
    districts: [
      {
        name: 'Indore',
        taluks: [
          {
            name: 'Indore',
            hoblis: [
              { name: 'Indore', villages: ['Indore', 'Dewas', 'Ujjain', 'Dhar'] },
            ],
          },
        ],
      },
      {
        name: 'Bhopal',
        taluks: [
          {
            name: 'Bhopal',
            hoblis: [
              { name: 'Bhopal', villages: ['Bhopal', 'Vidisha', 'Raisen', 'Sehore'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Rajasthan',
    districts: [
      {
        name: 'Jaipur',
        taluks: [
          {
            name: 'Jaipur',
            hoblis: [
              { name: 'Jaipur', villages: ['Jaipur', 'Chomu', 'Phulera', 'Sikar'] },
            ],
          },
        ],
      },
      {
        name: 'Jodhpur',
        taluks: [
          {
            name: 'Jodhpur',
            hoblis: [
              { name: 'Jodhpur', villages: ['Jodhpur', 'Pali', 'Barmer', 'Jaisalmer'] },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Gujarat',
    districts: [
      {
        name: 'Ahmedabad',
        taluks: [
          {
            name: 'Ahmedabad',
            hoblis: [
              { name: 'Ahmedabad', villages: ['Ahmedabad', 'Sanand', 'Dholka', 'Dhandhuka'] },
            ],
          },
        ],
      },
      {
        name: 'Anand',
        taluks: [
          {
            name: 'Anand',
            hoblis: [
              { name: 'Anand', villages: ['Anand', 'Vallabh Vidyanagar', 'Karamsad', 'Borsad'] },
            ],
          },
        ],
      },
    ],
  },
];

// Helper functions for cascading dropdowns
export function getStates(): string[] {
  return INDIA_REGIONS.map((s) => s.name);
}

export function getDistricts(stateName: string): string[] {
  const state = INDIA_REGIONS.find((s) => s.name === stateName);
  return state ? state.districts.map((d) => d.name) : [];
}

export function getTaluks(stateName: string, districtName: string): string[] {
  const state = INDIA_REGIONS.find((s) => s.name === stateName);
  const district = state?.districts.find((d) => d.name === districtName);
  return district ? district.taluks.map((t) => t.name) : [];
}

export function getHoblis(stateName: string, districtName: string, talukName: string): string[] {
  const state = INDIA_REGIONS.find((s) => s.name === stateName);
  const district = state?.districts.find((d) => d.name === districtName);
  const taluk = district?.taluks.find((t) => t.name === talukName);
  return taluk ? taluk.hoblis.map((h) => h.name) : [];
}

export function getVillages(stateName: string, districtName: string, talukName: string, hobliName: string): string[] {
  const state = INDIA_REGIONS.find((s) => s.name === stateName);
  const district = state?.districts.find((d) => d.name === districtName);
  const taluk = district?.taluks.find((t) => t.name === talukName);
  const hobli = taluk?.hoblis.find((h) => h.name === hobliName);
  return hobli ? hobli.villages : [];
}
