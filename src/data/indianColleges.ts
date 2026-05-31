export interface CollegeRecord {
  id: string;
  college_name: string;
  state: string;
  city: string;
  university_type: string;
}

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
].sort((a, b) => a.localeCompare(b));

export const INDIAN_COLLEGES: CollegeRecord[] = [
  // 1. Andhra Pradesh
  { id: "ap-01", college_name: "Andhra University (AU)", state: "Andhra Pradesh", city: "Visakhapatnam", university_type: "State" },
  { id: "ap-02", college_name: "Jawaharlal Nehru Technological University (JNTUK)", state: "Andhra Pradesh", city: "Kakinada", university_type: "State" },
  { id: "ap-03", college_name: "Sri Venkateswara University (SVU)", state: "Andhra Pradesh", city: "Tirupati", university_type: "State" },
  { id: "ap-04", college_name: "Koneru Lakshmaiah Education Foundation (KL University)", state: "Andhra Pradesh", city: "Guntur", university_type: "Deemed" },
  { id: "ap-05", college_name: "Vellore Institute of Technology (VIT AP)", state: "Andhra Pradesh", city: "Amaravati", university_type: "Private" },
  { id: "ap-06", college_name: "SRM University AP", state: "Andhra Pradesh", city: "Amaravati", university_type: "Private" },
  { id: "ap-07", college_name: "GMR Institute of Technology (GMRIT)", state: "Andhra Pradesh", city: "Rajam", university_type: "Autonomous" },
  { id: "ap-08", college_name: "Gayatri Vidya Parishad College of Engineering (GVPCE)", state: "Andhra Pradesh", city: "Visakhapatnam", university_type: "Autonomous" },

  // 2. Arunachal Pradesh
  { id: "ar-01", college_name: "Rajiv Gandhi University (RGU)", state: "Arunachal Pradesh", city: "Itanagar", university_type: "Central" },
  { id: "ar-02", college_name: "National Institute of Technology (NIT) Arunachal Pradesh", state: "Arunachal Pradesh", city: "Yupia", university_type: "Central" },
  { id: "ar-03", college_name: "North Eastern Regional Institute of Science and Technology (NERIST)", state: "Arunachal Pradesh", city: "Nirjuli", university_type: "Deemed" },
  { id: "ar-04", college_name: "Himalayan University", state: "Arunachal Pradesh", city: "Itanagar", university_type: "Private" },
  { id: "ar-05", college_name: "Apex Professional University", state: "Arunachal Pradesh", city: "Pasighat", university_type: "Private" },

  // 3. Assam
  { id: "as-01", college_name: "Gauhati University", state: "Assam", city: "Guwahati", university_type: "State" },
  { id: "as-02", college_name: "Dibrugarh University", state: "Assam", city: "Dibrugarh", university_type: "State" },
  { id: "as-03", college_name: "Tezpur University", state: "Assam", city: "Tezpur", university_type: "Central" },
  { id: "as-04", college_name: "Assam University", state: "Assam", city: "Silchar", university_type: "Central" },
  { id: "as-05", college_name: "Indian Institute of Technology (IIT) Guwahati", state: "Assam", city: "Guwahati", university_type: "Central" },
  { id: "as-06", college_name: "National Institute of Technology (NIT) Silchar", state: "Assam", city: "Silchar", university_type: "Central" },
  { id: "as-07", college_name: "Assam Engineering College (AEC)", state: "Assam", city: "Guwahati", university_type: "State" },
  { id: "as-08", college_name: "Jorhat Engineering College (JEC)", state: "Assam", city: "Jorhat", university_type: "State" },

  // 4. Bihar
  { id: "br-01", college_name: "Patna University", state: "Bihar", city: "Patna", university_type: "State" },
  { id: "br-02", college_name: "Aryabhatta Knowledge University (AKU)", state: "Bihar", city: "Patna", university_type: "State" },
  { id: "br-03", college_name: "Indian Institute of Technology (IIT) Patna", state: "Bihar", city: "Patna", university_type: "Central" },
  { id: "br-04", college_name: "National Institute of Technology (NIT) Patna", state: "Bihar", city: "Patna", university_type: "Central" },
  { id: "br-05", college_name: "Birla Institute of Technology (BIT) Patna", state: "Bihar", city: "Patna", university_type: "Deemed" },
  { id: "br-06", college_name: "Nalanda University", state: "Bihar", city: "Rajgir", university_type: "Central" },
  { id: "br-07", college_name: "Muzaffarpur Institute of Technology (MIT)", state: "Bihar", city: "Muzaffarpur", university_type: "State" },
  { id: "br-08", college_name: "Bhagalpur College of Engineering (BCE)", state: "Bihar", city: "Bhagalpur", university_type: "State" },

  // 5. Chhattisgarh
  { id: "cg-01", college_name: "Pandit Ravishankar Shukla University (PRSU)", state: "Chhattisgarh", city: "Raipur", university_type: "State" },
  { id: "cg-02", college_name: "Chhattisgarh Swami Vivekanand Technical University (CSVTU)", state: "Chhattisgarh", city: "Bhilai", university_type: "State" },
  { id: "cg-03", college_name: "National Institute of Technology (NIT) Raipur", state: "Chhattisgarh", city: "Raipur", university_type: "Central" },
  { id: "cg-04", college_name: "Indian Institute of Technology (IIT) Bhilai", state: "Chhattisgarh", city: "Bhilai", university_type: "Central" },
  { id: "cg-05", college_name: "Guru Ghasidas Vishwavidyalaya", state: "Chhattisgarh", city: "Bilaspur", university_type: "Central" },
  { id: "cg-06", college_name: "International Institute of Information Technology (IIIT) Naya Raipur", state: "Chhattisgarh", city: "Naya Raipur", university_type: "State" },
  { id: "cg-07", college_name: "Bhilai Institute of Technology (BIT)", state: "Chhattisgarh", city: "Durg", university_type: "Autonomous" },

  // 6. Goa
  { id: "ga-01", college_name: "Goa University", state: "Goa", city: "Taleigao", university_type: "State" },
  { id: "ga-02", college_name: "National Institute of Technology (NIT) Goa", state: "Goa", city: "Farmagudi", university_type: "Central" },
  { id: "ga-03", college_name: "BITS Pilani K.K. Birla Goa Campus", state: "Goa", city: "Zuarinagar", university_type: "Deemed" },
  { id: "ga-04", college_name: "Goa Engineering College (GEC)", state: "Goa", city: "Farmagudi", university_type: "State" },
  { id: "ga-05", college_name: "Padre Conceicao College of Engineering (PCCE)", state: "Goa", city: "Verna", university_type: "Private" },
  { id: "ga-06", college_name: "Don Bosco College of Engineering", state: "Goa", city: "Fatorda", university_type: "Private" },

  // 7. Gujarat
  { id: "gj-01", college_name: "Gujarat Technological University (GTU)", state: "Gujarat", city: "Ahmedabad", university_type: "State" },
  { id: "gj-02", college_name: "Maharaja Sayajirao University of Baroda (MSU)", state: "Gujarat", city: "Vadodara", university_type: "State" },
  { id: "gj-03", college_name: "Indian Institute of Technology (IIT) Gandhinagar", state: "Gujarat", city: "Gandhinagar", university_type: "Central" },
  { id: "gj-04", college_name: "Sardar Vallabhbhai National Institute of Technology (SVNIT)", state: "Gujarat", city: "Surat", university_type: "Central" },
  { id: "gj-05", college_name: "Dhirubhai Ambani Institute of Information and Communication Technology (DA-IICT)", state: "Gujarat", city: "Gandhinagar", university_type: "Private" },
  { id: "gj-06", college_name: "Nirma University", state: "Gujarat", city: "Ahmedabad", university_type: "Private" },
  { id: "gj-07", college_name: "Pandit Deendayal Energy University (PDEU)", state: "Gujarat", city: "Gandhinagar", university_type: "Private" },
  { id: "gj-08", college_name: "L.D. College of Engineering (LDCE)", state: "Gujarat", city: "Ahmedabad", university_type: "State" },

  // 8. Haryana
  { id: "hr-01", college_name: "Kurukshetra University", state: "Haryana", city: "Kurukshetra", university_type: "State" },
  { id: "hr-02", college_name: "Maharshi Dayanand University (MDU)", state: "Haryana", city: "Rohtak", university_type: "State" },
  { id: "hr-03", college_name: "J.C. Bose University of Science and Technology (YMCA)", state: "Haryana", city: "Faridabad", university_type: "State" },
  { id: "hr-04", college_name: "National Institute of Technology (NIT) Kurukshetra", state: "Haryana", city: "Kurukshetra", university_type: "Central" },
  { id: "hr-05", college_name: "Ashoka University", state: "Haryana", city: "Sonipat", university_type: "Private" },
  { id: "hr-06", college_name: "O.P. Jindal Global University", state: "Haryana", city: "Sonipat", university_type: "Private" },
  { id: "hr-07", college_name: "Deenbandhu Chhotu Ram University of Science and Technology (DCRUST)", state: "Haryana", city: "Murthal", university_type: "State" },

  // 9. Himachal Pradesh
  { id: "hp-01", college_name: "Himachal Pradesh University (HPU)", state: "Himachal Pradesh", city: "Shimla", university_type: "State" },
  { id: "hp-02", college_name: "Himachal Pradesh Technical University (HPTU)", state: "Himachal Pradesh", city: "Hamirpur", university_type: "State" },
  { id: "hp-03", college_name: "Indian Institute of Technology (IIT) Mandi", state: "Himachal Pradesh", city: "Mandi", university_type: "Central" },
  { id: "hp-04", college_name: "National Institute of Technology (NIT) Hamirpur", state: "Himachal Pradesh", city: "Hamirpur", university_type: "Central" },
  { id: "hp-05", college_name: "Jaypee University of Information Technology (JUIT)", state: "Himachal Pradesh", city: "Waknaghat", university_type: "Private" },
  { id: "hp-06", college_name: "Shoolini University of Biotechnology and Management Sciences", state: "Himachal Pradesh", city: "Solan", university_type: "Private" },

  // 10. Jharkhand
  { id: "jh-01", college_name: "Ranchi University", state: "Jharkhand", city: "Ranchi", university_type: "State" },
  { id: "jh-02", college_name: "Jharkhand Technological University (JUT)", state: "Jharkhand", city: "Ranchi", university_type: "State" },
  { id: "jh-03", college_name: "Indian Institute of Technology (IIT ISM) Dhanbad", state: "Jharkhand", city: "Dhanbad", university_type: "Central" },
  { id: "jh-04", college_name: "Birla Institute of Technology (BIT Mesra)", state: "Jharkhand", city: "Ranchi", university_type: "Deemed" },
  { id: "jh-05", college_name: "National Institute of Technology (NIT) Jamshedpur", state: "Jharkhand", city: "Jamshedpur", university_type: "Central" },
  { id: "jh-06", college_name: "Birsa Institute of Technology (BIT Sindri)", state: "Jharkhand", city: "Dhanbad", university_type: "State" },
  { id: "jh-07", college_name: "XLRI - Xavier School of Management", state: "Jharkhand", city: "Jamshedpur", university_type: "Private" },

  // 11. Karnataka
  { id: "ka-01", college_name: "Visvesvaraya Technological University (VTU)", state: "Karnataka", city: "Belagavi", university_type: "State" },
  { id: "ka-02", college_name: "Bangalore University", state: "Karnataka", city: "Bengaluru", university_type: "State" },
  { id: "ka-03", college_name: "National Institute of Technology Karnataka (NITK) Surathkal", state: "Karnataka", city: "Mangaluru", university_type: "Central" },
  { id: "ka-04", college_name: "Indian Institute of Science (IISc)", state: "Karnataka", city: "Bengaluru", university_type: "Central" },
  { id: "ka-05", college_name: "International Institute of Information Technology (IIIT) Bangalore", state: "Karnataka", city: "Bengaluru", university_type: "Deemed" },
  { id: "ka-06", college_name: "RV College of Engineering (RVCE)", state: "Karnataka", city: "Bengaluru", university_type: "Autonomous" },
  { id: "ka-07", college_name: "BMS College of Engineering (BMSCE)", state: "Karnataka", city: "Bengaluru", university_type: "Autonomous" },
  { id: "ka-08", college_name: "PES University", state: "Karnataka", city: "Bengaluru", university_type: "Private" },
  { id: "ka-09", college_name: "M.S. Ramaiah Institute of Technology (MSRIT)", state: "Karnataka", city: "Bengaluru", university_type: "Autonomous" },
  { id: "ka-10", college_name: "Manipal Academy of Higher Education (MAHE)", state: "Karnataka", city: "Manipal", university_type: "Deemed" },

  // 12. Kerala
  { id: "kl-01", college_name: "APJ Abdul Kalam Technological University (KTU)", state: "Kerala", city: "Thiruvananthapuram", university_type: "State" },
  { id: "kl-02", college_name: "University of Kerala", state: "Kerala", city: "Thiruvananthapuram", university_type: "State" },
  { id: "kl-03", college_name: "Cochin University of Science and Technology (CUSAT)", state: "Kerala", city: "Kochi", university_type: "State" },
  { id: "kl-04", college_name: "National Institute of Technology (NIT) Calicut", state: "Kerala", city: "Kozhikode", university_type: "Central" },
  { id: "kl-05", college_name: "Indian Institute of Space Science and Technology (IIST)", state: "Kerala", city: "Thiruvananthapuram", university_type: "Deemed" },
  { id: "kl-06", college_name: "College of Engineering (CET)", state: "Kerala", city: "Thiruvananthapuram", university_type: "State" },
  { id: "kl-07", college_name: "Government Engineering College (GEC)", state: "Kerala", city: "Thrissur", university_type: "State" },
  { id: "kl-08", college_name: "TKM College of Engineering", state: "Kerala", city: "Kollam", university_type: "Autonomous" },

  // 13. Madhya Pradesh
  { id: "mp-01", college_name: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)", state: "Madhya Pradesh", city: "Bhopal", university_type: "State" },
  { id: "mp-02", college_name: "Devi Ahilya Vishwavidyalaya (DAVV)", state: "Madhya Pradesh", city: "Indore", university_type: "State" },
  { id: "mp-03", college_name: "Indian Institute of Technology (IIT) Indore", state: "Madhya Pradesh", city: "Indore", university_type: "Central" },
  { id: "mp-04", college_name: "Maulana Azad National Institute of Technology (MANIT)", state: "Madhya Pradesh", city: "Bhopal", university_type: "Central" },
  { id: "mp-05", college_name: "ABV-Indian Institute of Information Technology and Management (IIITM)", state: "Madhya Pradesh", city: "Gwalior", university_type: "Central" },
  { id: "mp-06", college_name: "Shri Govindram Seksaria Institute of Technology and Science (SGSITS)", state: "Madhya Pradesh", city: "Indore", university_type: "Autonomous" },
  { id: "mp-07", college_name: "Jabalpur Engineering College (JEC)", state: "Madhya Pradesh", city: "Jabalpur", university_type: "State" },

  // 14. Maharashtra
  { id: "mh-01", college_name: "Savitribai Phule Pune University (SPPU)", state: "Maharashtra", city: "Pune", university_type: "State" },
  { id: "mh-02", college_name: "University of Mumbai (MU)", state: "Maharashtra", city: "Mumbai", university_type: "State" },
  { id: "mh-03", college_name: "Indian Institute of Technology (IIT) Bombay", state: "Maharashtra", city: "Mumbai", university_type: "Central" },
  { id: "mh-04", college_name: "Visvesvaraya National Institute of Technology (VNIT)", state: "Maharashtra", city: "Nagpur", university_type: "Central" },
  { id: "mh-05", college_name: "College of Engineering Pune (COEP Tech)", state: "Maharashtra", city: "Pune", university_type: "State" },
  { id: "mh-06", college_name: "Veermata Jijabai Technological Institute (VJTI)", state: "Maharashtra", city: "Mumbai", university_type: "Autonomous" },
  { id: "mh-07", college_name: "NMIMS University", state: "Maharashtra", city: "Mumbai", university_type: "Deemed" },
  { id: "mh-08", college_name: "Symbiosis International University", state: "Maharashtra", city: "Pune", university_type: "Deemed" },
  { id: "mh-09", college_name: "Vishwakarma Institute of Technology (VIT)", state: "Maharashtra", city: "Pune", university_type: "Autonomous" },
  { id: "mh-10", college_name: "Sardar Patel College of Engineering (SPCE)", state: "Maharashtra", city: "Mumbai", university_type: "Autonomous" },

  // 15. Manipur
  { id: "mn-01", college_name: "Manipur University", state: "Manipur", city: "Imphal", university_type: "Central" },
  { id: "mn-02", college_name: "National Institute of Technology (NIT) Manipur", state: "Manipur", city: "Imphal", university_type: "Central" },
  { id: "mn-03", college_name: "Indian Institute of Information Technology (IIIT) Senapati Manipur", state: "Manipur", city: "Mantripukhri", university_type: "Central" },
  { id: "mn-04", college_name: "Manipur Technical University (MTU)", state: "Manipur", city: "Imphal", university_type: "State" },

  // 16. Meghalaya
  { id: "ml-01", college_name: "North-Eastern Hill University (NEHU)", state: "Meghalaya", city: "Shillong", university_type: "Central" },
  { id: "ml-02", college_name: "National Institute of Technology (NIT) Meghalaya", state: "Meghalaya", city: "Shillong", university_type: "Central" },
  { id: "ml-03", college_name: "Indian Institute of Management (IIM) Shillong", state: "Meghalaya", city: "Shillong", university_type: "Central" },
  { id: "ml-04", college_name: "Martin Luther Christian University", state: "Meghalaya", city: "Shillong", university_type: "Private" },

  // 17. Mizoram
  { id: "mz-01", college_name: "Mizoram University", state: "Mizoram", city: "Aizawl", university_type: "Central" },
  { id: "mz-02", college_name: "National Institute of Technology (NIT) Mizoram", state: "Mizoram", city: "Aizawl", university_type: "Central" },
  { id: "mz-03", college_name: "ICFAI University Mizoram", state: "Mizoram", city: "Aizawl", university_type: "Private" },

  // 18. Nagaland
  { id: "nl-01", college_name: "Nagaland University", state: "Nagaland", city: "Lumami", university_type: "Central" },
  { id: "nl-02", college_name: "National Institute of Technology (NIT) Nagaland", state: "Nagaland", city: "Chumukedima", university_type: "Central" },
  { id: "nl-03", college_name: "St. Joseph University", state: "Nagaland", city: "Dimapur", university_type: "Private" },

  // 19. Odisha
  { id: "or-01", college_name: "Biju Patnaik University of Technology (BPUT)", state: "Odisha", city: "Rourkela", university_type: "State" },
  { id: "or-02", college_name: "Utkal University", state: "Odisha", city: "Bhubaneswar", university_type: "State" },
  { id: "or-03", college_name: "National Institute of Technology (NIT) Rourkela", state: "Odisha", city: "Rourkela", university_type: "Central" },
  { id: "or-04", college_name: "Indian Institute of Technology (IIT) Bhubaneswar", state: "Odisha", city: "Bhubaneswar", university_type: "Central" },
  { id: "or-05", college_name: "Kalinga Institute of Industrial Technology (KIIT)", state: "Odisha", city: "Bhubaneswar", university_type: "Deemed" },
  { id: "or-06", college_name: "Siksha 'O' Anusandhan (SOA)", state: "Odisha", city: "Bhubaneswar", university_type: "Deemed" },
  { id: "or-07", college_name: "Veer Surendra Sai University of Technology (VSSUT)", state: "Odisha", city: "Sambalpur", university_type: "State" },
  { id: "or-08", college_name: "Odisha University of Technology and Research (OUTR)", state: "Odisha", city: "Bhubaneswar", university_type: "State" },

  // 20. Punjab
  { id: "pb-01", college_name: "I.K. Gujral Punjab Technical University (IKGPTU)", state: "Punjab", city: "Jalandhar", university_type: "State" },
  { id: "pb-02", college_name: "Panjab University", state: "Punjab", city: "Chandigarh", university_type: "Inter-State" },
  { id: "pb-03", college_name: "Thapar Institute of Engineering and Technology", state: "Punjab", city: "Patiala", university_type: "Deemed" },
  { id: "pb-04", college_name: "Dr. B.R. Ambedkar National Institute of Technology (NIT) Jalandhar", state: "Punjab", city: "Jalandhar", university_type: "Central" },
  { id: "pb-05", college_name: "Indian Institute of Technology (IIT) Ropar", state: "Punjab", city: "Rupnagar", university_type: "Central" },
  { id: "pb-06", college_name: "Punjab Engineering College (PEC)", state: "Punjab", city: "Chandigarh", university_type: "Deemed" },
  { id: "pb-07", college_name: "Guru Nanak Dev Engineering College (GNDEC)", state: "Punjab", city: "Ludhiana", university_type: "Autonomous" },

  // 21. Rajasthan
  { id: "rj-01", college_name: "Rajasthan Technical University (RTU)", state: "Rajasthan", city: "Kota", university_type: "State" },
  { id: "rj-02", college_name: "Birla Institute of Technology and Science (BITS Pilani)", state: "Rajasthan", city: "Pilani", university_type: "Deemed" },
  { id: "rj-03", college_name: "Malaviya National Institute of Technology (MNIT) Jaipur", state: "Rajasthan", city: "Jaipur", university_type: "Central" },
  { id: "rj-04", college_name: "Indian Institute of Technology (IIT) Jodhpur", state: "Rajasthan", city: "Jodhpur", university_type: "Central" },
  { id: "rj-05", college_name: "LNM Institute of Information Technology (LNMIIT)", state: "Rajasthan", city: "Jaipur", university_type: "Deemed" },
  { id: "rj-06", college_name: "Banasthali Vidyapith", state: "Rajasthan", city: "Banasthali", university_type: "Deemed" },
  { id: "rj-07", college_name: "College of Technology and Engineering (CTAE)", state: "Rajasthan", city: "Udaipur", university_type: "Constituent" },

  // 22. Sikkim
  { id: "sk-01", college_name: "Sikkim University", state: "Sikkim", city: "Gangtok", university_type: "Central" },
  { id: "sk-02", college_name: "Sikkim Manipal University (SMU)", state: "Sikkim", city: "Gangtok", university_type: "Private" },
  { id: "sk-03", college_name: "National Institute of Technology (NIT) Sikkim", state: "Sikkim", city: "Ravangla", university_type: "Central" },
  { id: "sk-04", college_name: "SRM University Sikkim", state: "Sikkim", city: "Gangtok", university_type: "Private" },

  // 23. Tamil Nadu
  { id: "tn-01", college_name: "Anna University", state: "Tamil Nadu", city: "Chennai", university_type: "State" },
  { id: "tn-02", college_name: "University of Madras", state: "Tamil Nadu", city: "Chennai", university_type: "State" },
  { id: "tn-03", college_name: "Indian Institute of Technology (IIT) Madras", state: "Tamil Nadu", city: "Chennai", university_type: "Central" },
  { id: "tn-04", college_name: "National Institute of Technology (NIT) Trichy", state: "Tamil Nadu", city: "Tiruchirappalli", university_type: "Central" },
  { id: "tn-05", college_name: "Vellore Institute of Technology (VIT)", state: "Tamil Nadu", city: "Vellore", university_type: "Deemed" },
  { id: "tn-06", college_name: "SRM Institute of Science and Technology", state: "Tamil Nadu", city: "Chennai", university_type: "Deemed" },
  { id: "tn-07", college_name: "Sastra Deemed University", state: "Tamil Nadu", city: "Thanjavur", university_type: "Deemed" },
  { id: "tn-08", college_name: "PSG College of Technology (PSG Tech)", state: "Tamil Nadu", city: "Coimbatore", university_type: "Autonomous" },
  { id: "tn-09", college_name: "SSN College of Engineering", state: "Tamil Nadu", city: "Chennai", university_type: "Autonomous" },
  { id: "tn-10", college_name: "Amrita Vishwa Vidyapeetham", state: "Tamil Nadu", city: "Coimbatore", university_type: "Deemed" },

  // 24. Telangana
  { id: "ts-01", college_name: "Jawaharlal Nehru Technological University (JNTU Hyderabad)", state: "Telangana", city: "Hyderabad", university_type: "State" },
  { id: "ts-02", college_name: "Osmania University", state: "Telangana", city: "Hyderabad", university_type: "State" },
  { id: "ts-03", college_name: "University of Hyderabad", state: "Telangana", city: "Hyderabad", university_type: "Central" },
  { id: "ts-04", college_name: "Chaitanya Bharathi Institute of Technology (CBIT)", state: "Telangana", city: "Hyderabad", university_type: "Autonomous" },
  { id: "ts-05", college_name: "VNR VJIET", state: "Telangana", city: "Hyderabad", university_type: "Autonomous" },
  { id: "ts-06", college_name: "G. Narayanamma Institute of Technology and Science (GNITS)", state: "Telangana", city: "Hyderabad", university_type: "Autonomous" },
  { id: "ts-07", college_name: "GRIET", state: "Telangana", city: "Hyderabad", university_type: "Autonomous" },
  { id: "ts-08", college_name: "Vasavi College of Engineering", state: "Telangana", city: "Hyderabad", university_type: "Autonomous" },
  { id: "ts-09", college_name: "MGIT", state: "Telangana", city: "Hyderabad", university_type: "Autonomous" },
  { id: "ts-10", college_name: "MLRIT", state: "Telangana", city: "Hyderabad", university_type: "Autonomous" },
  { id: "ts-11", college_name: "Malla Reddy Engineering College", state: "Telangana", city: "Secunderabad", university_type: "Autonomous" },

  // 25. Tripura
  { id: "tr-01", college_name: "Tripura University", state: "Tripura", city: "Agartala", university_type: "Central" },
  { id: "tr-02", college_name: "National Institute of Technology (NIT) Tripura", state: "Tripura", city: "Agartala", university_type: "Central" },
  { id: "tr-03", college_name: "Tripura Institute of Technology (TIT)", state: "Tripura", city: "Agartala", university_type: "State" },

  // 26. Uttar Pradesh
  { id: "up-01", college_name: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)", state: "Uttar Pradesh", city: "Lucknow", university_type: "State" },
  { id: "up-02", college_name: "Banaras Hindu University (BHU)", state: "Uttar Pradesh", city: "Varanasi", university_type: "Central" },
  { id: "up-03", college_name: "Aligarh Muslim University (AMU)", state: "Uttar Pradesh", city: "Aligarh", university_type: "Central" },
  { id: "up-04", college_name: "Indian Institute of Technology (IIT) Kanpur", state: "Uttar Pradesh", city: "Kanpur", university_type: "Central" },
  { id: "up-05", college_name: "IIT BHU", state: "Uttar Pradesh", city: "Varanasi", university_type: "Central" },
  { id: "up-06", college_name: "Motilal Nehru National Institute of Technology (MNNIT)", state: "Uttar Pradesh", city: "Prayagraj", university_type: "Central" },
  { id: "up-07", college_name: "Amity University", state: "Uttar Pradesh", city: "Noida", university_type: "Private" },
  { id: "up-08", college_name: "Harcourt Butler Technical University (HBTU)", state: "Uttar Pradesh", city: "Kanpur", university_type: "State" },
  { id: "up-09", college_name: "Madan Mohan Malaviya University of Technology (MMMUT)", state: "Uttar Pradesh", city: "Gorakhpur", university_type: "State" },

  // 27. Uttarakhand
  { id: "ut-01", college_name: "Uttarakhand Technical University (UTU)", state: "Uttarakhand", city: "Dehradun", university_type: "State" },
  { id: "ut-02", college_name: "Indian Institute of Technology (IIT) Roorkee", state: "Uttarakhand", city: "Roorkee", university_type: "Central" },
  { id: "ut-03", college_name: "Govind Ballabh Pant University of Agriculture and Technology", state: "Uttarakhand", city: "Pantnagar", university_type: "State" },
  { id: "ut-04", college_name: "G.B. Pant Institute of Engineering and Technology", state: "Uttarakhand", city: "Pauri Garhwal", university_type: "State" },
  { id: "ut-05", college_name: "University of Petroleum and Energy Studies (UPES)", state: "Uttarakhand", city: "Dehradun", university_type: "Private" },
  { id: "ut-06", college_name: "Graphic Era University", state: "Uttarakhand", city: "Dehradun", university_type: "Deemed" },

  // 28. West Bengal
  { id: "wb-01", college_name: "Maulana Abul Kalam Azad University of Technology (MAKAUT)", state: "West Bengal", city: "Kolkata", university_type: "State" },
  { id: "wb-02", college_name: "Jadavpur University", state: "West Bengal", city: "Kolkata", university_type: "State" },
  { id: "wb-03", college_name: "Indian Institute of Technology (IIT) Kharagpur", state: "West Bengal", city: "Kharagpur", university_type: "Central" },
  { id: "wb-04", college_name: "IIEST Shibpur", state: "West Bengal", city: "Howrah", university_type: "Central" },
  { id: "wb-05", college_name: "National Institute of Technology (NIT) Durgapur", state: "West Bengal", city: "Durgapur", university_type: "Central" },
  { id: "wb-06", college_name: "Heritage Institute of Technology", state: "West Bengal", city: "Kolkata", university_type: "Autonomous" },
  { id: "wb-07", college_name: "Haldia Institute of Technology", state: "West Bengal", city: "Haldia", university_type: "Autonomous" },
  { id: "wb-08", college_name: "Kalyani Government Engineering College (KGEC)", state: "West Bengal", city: "Kalyani", university_type: "State" },

  // 29. Andaman and Nicobar Islands
  { id: "an-01", college_name: "Dr. B. R. Ambedkar Institute of Technology (DBRAIT)", state: "Andaman and Nicobar Islands", city: "Port Blair", university_type: "State" },
  { id: "an-02", college_name: "Jawaharlal Nehru Rajkeeya Mahavidyalaya (JNRM)", state: "Andaman and Nicobar Islands", city: "Port Blair", university_type: "State" },
  { id: "an-03", college_name: "Andaman & Nicobar Islands Institute of Medical Sciences (ANIIMS)", state: "Andaman and Nicobar Islands", city: "Port Blair", university_type: "State" },

  // 30. Chandigarh
  { id: "ch-01", college_name: "Punjab Engineering College (PEC)", state: "Chandigarh", city: "Chandigarh", university_type: "Deemed" },
  { id: "ch-02", college_name: "Panjab University (PU)", state: "Chandigarh", city: "Chandigarh", university_type: "State" },
  { id: "ch-03", college_name: "Chandigarh College of Engineering and Technology (CCET)", state: "Chandigarh", city: "Chandigarh", university_type: "State" },
  { id: "ch-04", college_name: "DAV College Chandigarh", state: "Chandigarh", city: "Chandigarh", university_type: "Private" },

  // 31. Dadra and Nagar Haveli and Daman and Diu
  { id: "dd-01", college_name: "Dr. A.P.J. Abdul Kalam Government College", state: "Dadra and Nagar Haveli and Daman and Diu", city: "Silvassa", university_type: "State" },
  { id: "dd-02", college_name: "Government Engineering College Daman", state: "Dadra and Nagar Haveli and Daman and Diu", city: "Daman", university_type: "State" },
  { id: "dd-03", college_name: "SSR College of Arts, Science and Commerce", state: "Dadra and Nagar Haveli and Daman and Diu", city: "Silvassa", university_type: "Private" },

  // 32. Delhi (NCT)
  { id: "dl-01", college_name: "Delhi Technological University (DTU)", state: "Delhi (NCT)", city: "Delhi", university_type: "State" },
  { id: "dl-02", college_name: "Netaji Subhas University of Technology (NSUT)", state: "Delhi (NCT)", city: "Delhi", university_type: "State" },
  { id: "dl-03", college_name: "Indraprastha Institute of Information Technology (IIIT Delhi)", state: "Delhi (NCT)", city: "Delhi", university_type: "State" },
  { id: "dl-04", college_name: "Indian Institute of Technology (IIT Delhi)", state: "Delhi (NCT)", city: "Delhi", university_type: "Central" },
  { id: "dl-05", college_name: "Guru Gobind Singh Indraprastha University (GGSIPU)", state: "Delhi (NCT)", city: "Delhi", university_type: "State" },
  { id: "dl-06", college_name: "Jamia Millia Islamia", state: "Delhi (NCT)", city: "Delhi", university_type: "Central" },
  { id: "dl-07", college_name: "Hansraj College, University of Delhi", state: "Delhi (NCT)", city: "Delhi", university_type: "State" },
  { id: "dl-08", college_name: "Miranda House, University of Delhi", state: "Delhi (NCT)", city: "Delhi", university_type: "State" },

  // 33. Jammu and Kashmir
  { id: "jk-01", college_name: "University of Jammu", state: "Jammu and Kashmir", city: "Jammu", university_type: "State" },
  { id: "jk-02", college_name: "University of Kashmir", state: "Jammu and Kashmir", city: "Srinagar", university_type: "State" },
  { id: "jk-03", college_name: "National Institute of Technology (NIT) Srinagar", state: "Jammu and Kashmir", city: "Srinagar", university_type: "Central" },
  { id: "jk-04", college_name: "Shri Mata Vaishno Devi University (SMVDU)", state: "Jammu and Kashmir", city: "Katra", university_type: "State" },
  { id: "jk-05", college_name: "Islamic University of Science & Technology (IUST)", state: "Jammu and Kashmir", city: "Awantipora", university_type: "State" },
  { id: "jk-06", college_name: "Government College of Engineering and Technology (GCET)", state: "Jammu and Kashmir", city: "Jammu", university_type: "State" },

  // 34. Ladakh
  { id: "ld-01", college_name: "University of Ladakh", state: "Ladakh", city: "Leh", university_type: "State" },
  { id: "ld-02", college_name: "Eliezer Joldan Memorial College (EJM College)", state: "Ladakh", city: "Leh", university_type: "State" },
  { id: "ld-03", college_name: "Government Degree College Kargil", state: "Ladakh", city: "Kargil", university_type: "State" },

  // 35. Lakshadweep
  { id: "lk-01", college_name: "Calicut University Centre Kadmat", state: "Lakshadweep", city: "Kadmat", university_type: "State" },
  { id: "lk-02", college_name: "Calicut University Centre Andrott", state: "Lakshadweep", city: "Andrott", university_type: "State" },
  { id: "lk-03", college_name: "Government Degree College Kavaratti", state: "Lakshadweep", city: "Kavaratti", university_type: "State" },

  // 36. Puducherry
  { id: "py-01", college_name: "Pondicherry University", state: "Puducherry", city: "Puducherry", university_type: "Central" },
  { id: "py-02", college_name: "Pondicherry Engineering College (PEC)", state: "Puducherry", city: "Puducherry", university_type: "State" },
  { id: "py-03", college_name: "Sri Manakula Vinayagar Engineering College (SMVEC)", state: "Puducherry", city: "Puducherry", university_type: "Autonomous" },
  { id: "py-04", college_name: "Rajiv Gandhi College of Engineering and Technology (RGCET)", state: "Puducherry", city: "Puducherry", university_type: "Private" }
];
