//Define array of available EV connection types
const connectionTypes = [
  {
    FormalName: "Avcon SAE J1772-2001",
    IsDiscontinued: true,
    IsObsolete: false,
    ID: 7,
    Title: "Avcon Connector"
  },
  {
    FormalName: null,
    IsDiscontinued: null,
    IsObsolete: null,
    ID: 4,
    Title: "Blue Commando (2P+E)"
  },
  {
    FormalName: "BS1363 / Type G",
    IsDiscontinued: null,
    IsObsolete: null,
    ID: 3,
    Title: "BS1363 3 Pin 13 Amp"
  },
  {
    FormalName: "IEC 62196-3 Configuration EE",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 32,
    Title: "CCS (Type 1)"
  },
  {
    FormalName: "IEC 62196-3 Configuration FF",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 33,
    Title: "CCS (Type 2)"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 16,
    Title: "CEE 3 Pin"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 17,
    Title: "CEE 5 Pin"
  },
  {
    FormalName: "CEE 7/4",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 28,
    Title: "CEE 7/4 - Schuko - Type F"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 23,
    Title: "CEE 7/5"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 18,
    Title: "CEE+ 7 Pin"
  },
  {
    FormalName: "IEC 62196-3 Configuration AA",
    IsDiscontinued: null,
    IsObsolete: null,
    ID: 2,
    Title: "CHAdeMO"
  },
  {
    FormalName: "Europlug 2-Pin (CEE 7/16)",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 13,
    Title: "Europlug 2-Pin (CEE 7/16)"
  },
  {
    FormalName: "GB-T AC - GB/T 20234.2 (Socket)",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1038,
    Title: "GB-T AC - GB/T 20234.2 (Socket)"
  },
  {
    FormalName: "GB-T AC - GB/T 20234.2 (Tethered Cable)",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1039,
    Title: "GB-T AC - GB/T 20234.2 (Tethered Cable)"
  },
  {
    FormalName: "GB-T DC - GB/T 20234.3",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1040,
    Title: "GB-T DC - GB/T 20234.3"
  },
  {
    FormalName: "IEC 60309 3-pin",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 34,
    Title: "IEC 60309 3-pin"
  },
  {
    FormalName: "IEC 60309 5-pin",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 35,
    Title: "IEC 60309 5-pin"
  },
  {
    FormalName: "Large Paddle Inductive",
    IsDiscontinued: true,
    IsObsolete: true,
    ID: 5,
    Title: "LP Inductive"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 10,
    Title: "NEMA 14-30"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 11,
    Title: "NEMA 14-50"
  },
  {
    FormalName: "NEMA 5-15R",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 22,
    Title: "NEMA 5-15R"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 9,
    Title: "NEMA 5-20R"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 15,
    Title: "NEMA 6-15"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 14,
    Title: "NEMA 6-20"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1042,
    Title: "NEMA TT-30R"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 36,
    Title: "SCAME Type 3A (Low Power)"
  },
  {
    FormalName: "IEC 62196-2 Type 3",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 26,
    Title: "SCAME Type 3C (Schneider-Legrand)"
  },
  {
    FormalName: "Small Paddle Inductive",
    IsDiscontinued: true,
    IsObsolete: true,
    ID: 6,
    Title: "SP Inductive"
  },
  {
    FormalName: "T13/ IEC Type J",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1037,
    Title: "T13 - SEC1011 ( Swiss domestic 3-pin ) - Type J"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 30,
    Title: "Tesla (Model S/X)"
  },
  {
    FormalName: "Tesla Connector",
    IsDiscontinued: true,
    IsObsolete: false,
    ID: 8,
    Title: "Tesla (Roadster)"
  },
  {
    FormalName: "Tesla Battery Swap Station",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 31,
    Title: "Tesla Battery Swap"
  },
  {
    FormalName: "Tesla Supercharger",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 27,
    Title: "Tesla Supercharger"
  },
  {
    FormalName: "AS/NZS 3123 Three Phase",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1041,
    Title: "Three Phase 5-Pin (AS/NZ 3123)"
  },
  {
    FormalName: "SAE J1772-2009",
    IsDiscontinued: null,
    IsObsolete: null,
    ID: 1,
    Title: "Type 1 (J1772)"
  },
  {
    FormalName: "IEC 62196-2 Type 2",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 25,
    Title: "Type 2 (Socket Only)"
  },
  {
    FormalName: "IEC 62196-2",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1036,
    Title: "Type 2 (Tethered Connector) "
  },
  {
    FormalName: "Type I/AS 3112/CPCS-CCC",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 29,
    Title: "Type I (AS 3112)"
  },
  {
    FormalName: "IEC Type M (SANS 164-1, IS 1293:2005)",
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 1043,
    Title: "Type M"
  },
  {
    FormalName: "Not Specified",
    IsDiscontinued: null,
    IsObsolete: null,
    ID: 0,
    Title: "Unknown"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 24,
    Title: "Wireless Charging"
  },
  {
    FormalName: null,
    IsDiscontinued: false,
    IsObsolete: false,
    ID: 21,
    Title: "XLR Plug (4 pin)"
  }
];

//Map connector types to IDs for filtering
const carToConnectorMap = {
    "Tesla" : [30, 8, 31, 27],
    "CHAdeMO" : [2],
    "CSS" : [32, 33],
    "J1772" : [1]
};

export { connectionTypes, carToConnectorMap };