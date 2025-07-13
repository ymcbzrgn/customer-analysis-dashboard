-- Add 2 detailed example organizational charts

-- Example 1: TechCorp Engineering Division - Complete tech company structure
INSERT INTO charts (name, description, config, source_table_name, chart_type, is_public, created_by) VALUES 
('TechCorp Engineering Division', 'Complete engineering organization structure with 15 employees across 4 departments including leadership, development, DevOps, and QA teams', '{
  "type": "organizational",
  "display": {
    "title": "TechCorp Engineering Division"
  },
  "nodes": [
    {
      "id": "ceo_tech",
      "type": "employee",
      "data": {
        "label": "Alexandra Rodriguez",
        "sublabel": "Chief Executive Officer",
        "department": "Executive",
        "level": 1,
        "email": "alexandra.rodriguez@techcorp.com",
        "phone": "+1 555 0001",
        "employeeId": "TC001",
        "avatar": "AR",
        "startDate": "2018-01-15",
        "location": "San Francisco, CA",
        "skills": ["Leadership", "Strategy", "Product Vision"],
        "directReports": 12
      },
      "position": { "x": 600, "y": 50 }
    },
    {
      "id": "cto_tech",
      "type": "employee",
      "data": {
        "label": "Marcus Chen",
        "sublabel": "Chief Technology Officer",
        "department": "Technology",
        "level": 2,
        "email": "marcus.chen@techcorp.com",
        "phone": "+1 555 0002",
        "employeeId": "TC002",
        "avatar": "MC",
        "reportsTo": "ceo_tech",
        "startDate": "2018-03-20",
        "location": "San Francisco, CA",
        "skills": ["Architecture", "Cloud Computing", "Team Leadership"],
        "certifications": ["AWS Solutions Architect", "Google Cloud Professional"]
      },
      "position": { "x": 300, "y": 200 }
    },
    {
      "id": "vp_eng",
      "type": "employee",
      "data": {
        "label": "Sarah Kim",
        "sublabel": "VP of Engineering",
        "department": "Engineering",
        "level": 2,
        "email": "sarah.kim@techcorp.com",
        "phone": "+1 555 0003",
        "employeeId": "TC003",
        "avatar": "SK",
        "reportsTo": "ceo_tech",
        "startDate": "2019-02-10",
        "location": "Austin, TX",
        "skills": ["Engineering Management", "Agile", "Product Development"],
        "education": "MS Computer Science - Stanford"
      },
      "position": { "x": 900, "y": 200 }
    },
    {
      "id": "eng_mgr_backend",
      "type": "employee",
      "data": {
        "label": "James Wilson",
        "sublabel": "Backend Engineering Manager",
        "department": "Engineering",
        "level": 3,
        "email": "james.wilson@techcorp.com",
        "phone": "+1 555 0004",
        "employeeId": "TC004",
        "avatar": "JW",
        "reportsTo": "vp_eng",
        "startDate": "2019-06-15",
        "location": "Austin, TX",
        "skills": ["Node.js", "Python", "Microservices", "Team Management"],
        "directReports": 4
      },
      "position": { "x": 700, "y": 350 }
    },
    {
      "id": "eng_mgr_frontend",
      "type": "employee",
      "data": {
        "label": "Emily Davis",
        "sublabel": "Frontend Engineering Manager",
        "department": "Engineering",
        "level": 3,
        "email": "emily.davis@techcorp.com",
        "phone": "+1 555 0005",
        "employeeId": "TC005",
        "avatar": "ED",
        "reportsTo": "vp_eng",
        "startDate": "2020-01-20",
        "location": "Remote - Portland, OR",
        "skills": ["React", "TypeScript", "UI/UX", "Team Leadership"],
        "directReports": 3
      },
      "position": { "x": 1100, "y": 350 }
    },
    {
      "id": "devops_lead",
      "type": "employee",
      "data": {
        "label": "Michael Zhang",
        "sublabel": "DevOps Team Lead",
        "department": "Technology",
        "level": 3,
        "email": "michael.zhang@techcorp.com",
        "phone": "+1 555 0006",
        "employeeId": "TC006",
        "avatar": "MZ",
        "reportsTo": "cto_tech",
        "startDate": "2019-09-10",
        "location": "San Francisco, CA",
        "skills": ["Kubernetes", "Docker", "CI/CD", "AWS"],
        "certifications": ["CKA", "AWS DevOps Professional"]
      },
      "position": { "x": 100, "y": 350 }
    },
    {
      "id": "qa_lead",
      "type": "employee",
      "data": {
        "label": "Lisa Thompson",
        "sublabel": "QA Team Lead",
        "department": "Technology",
        "level": 3,
        "email": "lisa.thompson@techcorp.com",
        "phone": "+1 555 0007",
        "employeeId": "TC007",
        "avatar": "LT",
        "reportsTo": "cto_tech",
        "startDate": "2020-04-05",
        "location": "Austin, TX",
        "skills": ["Test Automation", "Selenium", "Performance Testing"],
        "directReports": 2
      },
      "position": { "x": 500, "y": 350 }
    },
    {
      "id": "senior_backend_1",
      "type": "employee",
      "data": {
        "label": "Robert Martinez",
        "sublabel": "Senior Backend Developer",
        "department": "Engineering",
        "level": 4,
        "email": "robert.martinez@techcorp.com",
        "phone": "+1 555 0008",
        "employeeId": "TC008",
        "avatar": "RM",
        "reportsTo": "eng_mgr_backend",
        "startDate": "2020-08-15",
        "location": "Austin, TX",
        "skills": ["Node.js", "PostgreSQL", "GraphQL", "Redis"],
        "projects": ["Payment System", "User Authentication"]
      },
      "position": { "x": 600, "y": 500 }
    },
    {
      "id": "senior_backend_2",
      "type": "employee",
      "data": {
        "label": "Diana Lee",
        "sublabel": "Senior Backend Developer",
        "department": "Engineering",
        "level": 4,
        "email": "diana.lee@techcorp.com",
        "phone": "+1 555 0009",
        "employeeId": "TC009",
        "avatar": "DL",
        "reportsTo": "eng_mgr_backend",
        "startDate": "2021-01-10",
        "location": "Remote - Seattle, WA",
        "skills": ["Python", "Django", "Machine Learning", "Data Analytics"],
        "projects": ["Recommendation Engine", "Analytics Dashboard"]
      },
      "position": { "x": 800, "y": 500 }
    },
    {
      "id": "backend_dev",
      "type": "employee",
      "data": {
        "label": "Carlos Rodriguez",
        "sublabel": "Backend Developer",
        "department": "Engineering",
        "level": 5,
        "email": "carlos.rodriguez@techcorp.com",
        "phone": "+1 555 0010",
        "employeeId": "TC010",
        "avatar": "CR",
        "reportsTo": "eng_mgr_backend",
        "startDate": "2022-06-01",
        "location": "Austin, TX",
        "skills": ["Java", "Spring Boot", "MongoDB", "REST APIs"],
        "education": "BS Computer Science - UT Austin"
      },
      "position": { "x": 700, "y": 650 }
    },
    {
      "id": "senior_frontend_1",
      "type": "employee",
      "data": {
        "label": "Jessica Wang",
        "sublabel": "Senior Frontend Developer",
        "department": "Engineering",
        "level": 4,
        "email": "jessica.wang@techcorp.com",
        "phone": "+1 555 0011",
        "employeeId": "TC011",
        "avatar": "JWa",
        "reportsTo": "eng_mgr_frontend",
        "startDate": "2020-11-20",
        "location": "San Francisco, CA",
        "skills": ["React", "TypeScript", "Next.js", "Design Systems"],
        "projects": ["Component Library", "Mobile App Frontend"]
      },
      "position": { "x": 1000, "y": 500 }
    },
    {
      "id": "frontend_dev",
      "type": "employee",
      "data": {
        "label": "Ahmed Hassan",
        "sublabel": "Frontend Developer",
        "department": "Engineering",
        "level": 5,
        "email": "ahmed.hassan@techcorp.com",
        "phone": "+1 555 0012",
        "employeeId": "TC012",
        "avatar": "AH",
        "reportsTo": "eng_mgr_frontend",
        "startDate": "2022-09-15",
        "location": "Remote - New York, NY",
        "skills": ["Vue.js", "JavaScript", "CSS", "Figma"],
        "education": "BS Software Engineering - NYU"
      },
      "position": { "x": 1200, "y": 500 }
    },
    {
      "id": "devops_eng",
      "type": "employee",
      "data": {
        "label": "Kevin Park",
        "sublabel": "DevOps Engineer",
        "department": "Technology",
        "level": 4,
        "email": "kevin.park@techcorp.com",
        "phone": "+1 555 0013",
        "employeeId": "TC013",
        "avatar": "KP",
        "reportsTo": "devops_lead",
        "startDate": "2021-07-12",
        "location": "San Francisco, CA",
        "skills": ["Terraform", "Jenkins", "Monitoring", "Linux"],
        "certifications": ["AWS SysOps Administrator"]
      },
      "position": { "x": 100, "y": 500 }
    },
    {
      "id": "qa_eng_1",
      "type": "employee",
      "data": {
        "label": "Maria Gonzalez",
        "sublabel": "QA Engineer",
        "department": "Technology",
        "level": 4,
        "email": "maria.gonzalez@techcorp.com",
        "phone": "+1 555 0014",
        "employeeId": "TC014",
        "avatar": "MG",
        "reportsTo": "qa_lead",
        "startDate": "2021-11-08",
        "location": "Austin, TX",
        "skills": ["Cypress", "Jest", "API Testing", "Bug Tracking"],
        "projects": ["E2E Test Suite", "API Test Framework"]
      },
      "position": { "x": 400, "y": 500 }
    },
    {
      "id": "qa_eng_2",
      "type": "employee",
      "data": {
        "label": "Thomas Brown",
        "sublabel": "Performance QA Engineer",
        "department": "Technology",
        "level": 4,
        "email": "thomas.brown@techcorp.com",
        "phone": "+1 555 0015",
        "employeeId": "TC015",
        "avatar": "TB",
        "reportsTo": "qa_lead",
        "startDate": "2022-03-21",
        "location": "Remote - Chicago, IL",
        "skills": ["JMeter", "LoadRunner", "Performance Monitoring"],
        "specialization": "Performance Testing & Optimization"
      },
      "position": { "x": 600, "y": 500 }
    }
  ],
  "edges": [
    {
      "id": "ceo_tech-cto_tech",
      "source": "ceo_tech",
      "target": "cto_tech",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#9333ea", "strokeWidth": 3 }
    },
    {
      "id": "ceo_tech-vp_eng",
      "source": "ceo_tech",
      "target": "vp_eng",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#9333ea", "strokeWidth": 3 }
    },
    {
      "id": "cto_tech-devops_lead",
      "source": "cto_tech",
      "target": "devops_lead",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#3b82f6", "strokeWidth": 2 }
    },
    {
      "id": "cto_tech-qa_lead",
      "source": "cto_tech",
      "target": "qa_lead",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#3b82f6", "strokeWidth": 2 }
    },
    {
      "id": "vp_eng-eng_mgr_backend",
      "source": "vp_eng",
      "target": "eng_mgr_backend",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#10b981", "strokeWidth": 2 }
    },
    {
      "id": "vp_eng-eng_mgr_frontend",
      "source": "vp_eng",
      "target": "eng_mgr_frontend",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#10b981", "strokeWidth": 2 }
    },
    {
      "id": "eng_mgr_backend-senior_backend_1",
      "source": "eng_mgr_backend",
      "target": "senior_backend_1",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#10b981", "strokeWidth": 2 }
    },
    {
      "id": "eng_mgr_backend-senior_backend_2",
      "source": "eng_mgr_backend",
      "target": "senior_backend_2",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#10b981", "strokeWidth": 2 }
    },
    {
      "id": "eng_mgr_backend-backend_dev",
      "source": "eng_mgr_backend",
      "target": "backend_dev",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#10b981", "strokeWidth": 2 }
    },
    {
      "id": "eng_mgr_frontend-senior_frontend_1",
      "source": "eng_mgr_frontend",
      "target": "senior_frontend_1",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#10b981", "strokeWidth": 2 }
    },
    {
      "id": "eng_mgr_frontend-frontend_dev",
      "source": "eng_mgr_frontend",
      "target": "frontend_dev",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#10b981", "strokeWidth": 2 }
    },
    {
      "id": "devops_lead-devops_eng",
      "source": "devops_lead",
      "target": "devops_eng",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#3b82f6", "strokeWidth": 2 }
    },
    {
      "id": "qa_lead-qa_eng_1",
      "source": "qa_lead",
      "target": "qa_eng_1",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#3b82f6", "strokeWidth": 2 }
    },
    {
      "id": "qa_lead-qa_eng_2",
      "source": "qa_lead",
      "target": "qa_eng_2",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#3b82f6", "strokeWidth": 2 }
    }
  ],
  "flowSettings": {
    "direction": "vertical",
    "spacing": { "x": 200, "y": 150 },
    "autoLayout": true
  }
}'::jsonb, NULL, 'organizational', true, 1);

-- Example 2: GlobalCorp Sales & Marketing Division - Complete business organization
INSERT INTO charts (name, description, config, source_table_name, chart_type, is_public, created_by) VALUES 
('GlobalCorp Sales & Marketing Division', 'Comprehensive sales and marketing organization with 18 employees across regional sales teams, marketing, customer success, and business development', '{
  "type": "organizational",
  "display": {
    "title": "GlobalCorp Sales & Marketing Division"
  },
  "nodes": [
    {
      "id": "coo_global",
      "type": "employee",
      "data": {
        "label": "Jonathan Mitchell",
        "sublabel": "Chief Operating Officer",
        "department": "Executive",
        "level": 1,
        "email": "jonathan.mitchell@globalcorp.com",
        "phone": "+1 555 1001",
        "employeeId": "GC001",
        "avatar": "JM",
        "startDate": "2017-05-15",
        "location": "New York, NY",
        "skills": ["Operations", "Strategy", "P&L Management"],
        "experience": "15+ years operations leadership",
        "directReports": 16
      },
      "position": { "x": 800, "y": 50 }
    },
    {
      "id": "vp_sales",
      "type": "employee",
      "data": {
        "label": "Rachel Williams",
        "sublabel": "VP of Sales",
        "department": "Sales",
        "level": 2,
        "email": "rachel.williams@globalcorp.com",
        "phone": "+1 555 1002",
        "employeeId": "GC002",
        "avatar": "RW",
        "reportsTo": "coo_global",
        "startDate": "2018-08-20",
        "location": "New York, NY",
        "skills": ["Enterprise Sales", "Team Leadership", "Revenue Growth"],
        "achievements": ["150% quota attainment 2023", "Built $50M sales pipeline"],
        "directReports": 8
      },
      "position": { "x": 400, "y": 200 }
    },
    {
      "id": "vp_marketing",
      "type": "employee",
      "data": {
        "label": "David Chen",
        "sublabel": "VP of Marketing",
        "department": "Marketing",
        "level": 2,
        "email": "david.chen@globalcorp.com",
        "phone": "+1 555 1003",
        "employeeId": "GC003",
        "avatar": "DC",
        "reportsTo": "coo_global",
        "startDate": "2019-01-10",
        "location": "San Francisco, CA",
        "skills": ["Digital Marketing", "Brand Strategy", "Growth Marketing"],
        "certifications": ["Google Analytics", "HubSpot Marketing"],
        "directReports": 5
      },
      "position": { "x": 1200, "y": 200 }
    },
    {
      "id": "dir_customer_success",
      "type": "employee",
      "data": {
        "label": "Sophie Anderson",
        "sublabel": "Director of Customer Success",
        "department": "Sales",
        "level": 2,
        "email": "sophie.anderson@globalcorp.com",
        "phone": "+1 555 1004",
        "employeeId": "GC004",
        "avatar": "SA",
        "reportsTo": "coo_global",
        "startDate": "2019-11-05",
        "location": "Austin, TX",
        "skills": ["Customer Success", "Account Management", "Retention"],
        "metrics": ["95% customer retention", "120% net revenue retention"],
        "directReports": 3
      },
      "position": { "x": 800, "y": 200 }
    },
    {
      "id": "sales_mgr_east",
      "type": "employee",
      "data": {
        "label": "Michael Thompson",
        "sublabel": "Sales Manager - East Coast",
        "department": "Sales",
        "level": 3,
        "email": "michael.thompson@globalcorp.com",
        "phone": "+1 555 1005",
        "employeeId": "GC005",
        "avatar": "MT",
        "reportsTo": "vp_sales",
        "startDate": "2020-03-15",
        "location": "New York, NY",
        "skills": ["B2B Sales", "Account Management", "Territory Planning"],
        "territory": "East Coast - NY, NJ, CT, MA",
        "quota": "$2.5M annually",
        "directReports": 3
      },
      "position": { "x": 200, "y": 350 }
    },
    {
      "id": "sales_mgr_west",
      "type": "employee",
      "data": {
        "label": "Lisa Rodriguez",
        "sublabel": "Sales Manager - West Coast",
        "department": "Sales",
        "level": 3,
        "email": "lisa.rodriguez@globalcorp.com",
        "phone": "+1 555 1006",
        "employeeId": "GC006",
        "avatar": "LR",
        "reportsTo": "vp_sales",
        "startDate": "2020-07-20",
        "location": "Los Angeles, CA",
        "skills": ["Enterprise Sales", "Solution Selling", "Partnership Development"],
        "territory": "West Coast - CA, OR, WA, NV",
        "quota": "$3M annually",
        "directReports": 3
      },
      "position": { "x": 600, "y": 350 }
    },
    {
      "id": "biz_dev_mgr",
      "type": "employee",
      "data": {
        "label": "Alex Kumar",
        "sublabel": "Business Development Manager",
        "department": "Sales",
        "level": 3,
        "email": "alex.kumar@globalcorp.com",
        "phone": "+1 555 1007",
        "employeeId": "GC007",
        "avatar": "AK",
        "reportsTo": "vp_sales",
        "startDate": "2021-02-10",
        "location": "Chicago, IL",
        "skills": ["Strategic Partnerships", "Channel Development", "Contract Negotiation"],
        "focus": "Channel Partners & Strategic Alliances",
        "partnerships": "20+ active channel partners"
      },
      "position": { "x": 400, "y": 350 }
    },
    {
      "id": "marketing_mgr_digital",
      "type": "employee",
      "data": {
        "label": "Emma Johnson",
        "sublabel": "Digital Marketing Manager",
        "department": "Marketing",
        "level": 3,
        "email": "emma.johnson@globalcorp.com",
        "phone": "+1 555 1008",
        "employeeId": "GC008",
        "avatar": "EJ",
        "reportsTo": "vp_marketing",
        "startDate": "2020-09-15",
        "location": "San Francisco, CA",
        "skills": ["SEO/SEM", "Social Media", "Content Marketing", "Analytics"],
        "campaigns": ["Generated 500+ qualified leads Q4 2023"],
        "directReports": 2
      },
      "position": { "x": 1000, "y": 350 }
    },
    {
      "id": "marketing_mgr_product",
      "type": "employee",
      "data": {
        "label": "James Wilson",
        "sublabel": "Product Marketing Manager",
        "department": "Marketing",
        "level": 3,
        "email": "james.wilson@globalcorp.com",
        "phone": "+1 555 1009",
        "employeeId": "GC009",
        "avatar": "JWi",
        "reportsTo": "vp_marketing",
        "startDate": "2021-05-12",
        "location": "Austin, TX",
        "skills": ["Product Positioning", "Go-to-Market", "Competitive Analysis"],
        "launches": ["Led 3 major product launches in 2023"],
        "directReports": 1
      },
      "position": { "x": 1400, "y": 350 }
    },
    {
      "id": "cs_mgr",
      "type": "employee",
      "data": {
        "label": "Maria Garcia",
        "sublabel": "Customer Success Manager",
        "department": "Sales",
        "level": 3,
        "email": "maria.garcia@globalcorp.com",
        "phone": "+1 555 1010",
        "employeeId": "GC010",
        "avatar": "MG",
        "reportsTo": "dir_customer_success",
        "startDate": "2021-08-30",
        "location": "Austin, TX",
        "skills": ["Account Management", "Customer Onboarding", "Upselling"],
        "portfolio": "50 enterprise accounts worth $5M ARR",
        "directReports": 2
      },
      "position": { "x": 800, "y": 350 }
    },
    {
      "id": "sales_rep_east_1",
      "type": "employee",
      "data": {
        "label": "Robert Davis",
        "sublabel": "Senior Sales Representative",
        "department": "Sales",
        "level": 4,
        "email": "robert.davis@globalcorp.com",
        "phone": "+1 555 1011",
        "employeeId": "GC011",
        "avatar": "RD",
        "reportsTo": "sales_mgr_east",
        "startDate": "2021-11-20",
        "location": "Boston, MA",
        "skills": ["Consultative Selling", "CRM Management", "Cold Outreach"],
        "quota": "$800K annually",
        "performance": "125% quota attainment YTD"
      },
      "position": { "x": 50, "y": 500 }
    },
    {
      "id": "sales_rep_east_2",
      "type": "employee",
      "data": {
        "label": "Jennifer Brown",
        "sublabel": "Sales Representative",
        "department": "Sales",
        "level": 5,
        "email": "jennifer.brown@globalcorp.com",
        "phone": "+1 555 1012",
        "employeeId": "GC012",
        "avatar": "JB",
        "reportsTo": "sales_mgr_east",
        "startDate": "2022-04-15",
        "location": "New York, NY",
        "skills": ["Inside Sales", "Lead Qualification", "Product Demos"],
        "quota": "$600K annually",
        "education": "MBA - Columbia Business School"
      },
      "position": { "x": 200, "y": 500 }
    },
    {
      "id": "sales_rep_east_3",
      "type": "employee",
      "data": {
        "label": "Carlos Martinez",
        "sublabel": "Sales Development Representative",
        "department": "Sales",
        "level": 5,
        "email": "carlos.martinez@globalcorp.com",
        "phone": "+1 555 1013",
        "employeeId": "GC013",
        "avatar": "CM",
        "reportsTo": "sales_mgr_east",
        "startDate": "2023-01-10",
        "location": "New York, NY",
        "skills": ["Lead Generation", "Prospecting", "Sales Automation"],
        "metrics": "200+ qualified opportunities created",
        "career_path": "Promoted to AE track in 2024"
      },
      "position": { "x": 350, "y": 500 }
    },
    {
      "id": "sales_rep_west_1",
      "type": "employee",
      "data": {
        "label": "Sarah Kim",
        "sublabel": "Enterprise Sales Representative",
        "department": "Sales",
        "level": 4,
        "email": "sarah.kim@globalcorp.com",
        "phone": "+1 555 1014",
        "employeeId": "GC014",
        "avatar": "SKi",
        "reportsTo": "sales_mgr_west",
        "startDate": "2020-12-05",
        "location": "San Francisco, CA",
        "skills": ["Enterprise Sales", "Complex Deal Management", "Executive Selling"],
        "quota": "$1.2M annually",
        "achievements": ["Closed largest deal in company history - $2.5M"]
      },
      "position": { "x": 500, "y": 500 }
    },
    {
      "id": "sales_rep_west_2",
      "type": "employee",
      "data": {
        "label": "Daniel Lee",
        "sublabel": "Sales Representative",
        "department": "Sales",
        "level": 5,
        "email": "daniel.lee@globalcorp.com",
        "phone": "+1 555 1015",
        "employeeId": "GC015",
        "avatar": "DL",
        "reportsTo": "sales_mgr_west",
        "startDate": "2022-08-22",
        "location": "Los Angeles, CA",
        "skills": ["Mid-Market Sales", "Territory Management", "Customer Relationships"],
        "quota": "$700K annually",
        "specialization": "Mid-market technology companies"
      },
      "position": { "x": 650, "y": 500 }
    },
    {
      "id": "digital_marketing_spec",
      "type": "employee",
      "data": {
        "label": "Ashley Taylor",
        "sublabel": "Digital Marketing Specialist",
        "department": "Marketing",
        "level": 4,
        "email": "ashley.taylor@globalcorp.com",
        "phone": "+1 555 1016",
        "employeeId": "GC016",
        "avatar": "AT",
        "reportsTo": "marketing_mgr_digital",
        "startDate": "2022-06-10",
        "location": "Remote - Denver, CO",
        "skills": ["Google Ads", "Facebook Ads", "Email Marketing", "A/B Testing"],
        "campaigns": ["Managed $500K+ monthly ad spend"],
        "certifications": ["Google Ads Certified", "Facebook Blueprint"]
      },
      "position": { "x": 950, "y": 500 }
    },
    {
      "id": "content_marketing_spec",
      "type": "employee",
      "data": {
        "label": "Kevin Park",
        "sublabel": "Content Marketing Specialist",
        "department": "Marketing",
        "level": 4,
        "email": "kevin.park@globalcorp.com",
        "phone": "+1 555 1017",
        "employeeId": "GC017",
        "avatar": "KPa",
        "reportsTo": "marketing_mgr_digital",
        "startDate": "2023-02-15",
        "location": "San Francisco, CA",
        "skills": ["Content Creation", "SEO Writing", "Video Production", "Analytics"],
        "portfolio": ["50+ blog posts", "20+ videos", "10+ whitepapers"],
        "impact": "300% increase in organic traffic"
      },
      "position": { "x": 1150, "y": 500 }
    },
    {
      "id": "product_marketing_coord",
      "type": "employee",
      "data": {
        "label": "Hannah Williams",
        "sublabel": "Product Marketing Coordinator",
        "department": "Marketing",
        "level": 5,
        "email": "hannah.williams@globalcorp.com",
        "phone": "+1 555 1018",
        "employeeId": "GC018",
        "avatar": "HW",
        "reportsTo": "marketing_mgr_product",
        "startDate": "2023-07-20",
        "location": "Austin, TX",
        "skills": ["Market Research", "Competitive Analysis", "Sales Enablement"],
        "projects": ["Competitive intelligence reports", "Sales battle cards"],
        "education": "MBA Marketing - UT Austin"
      },
      "position": { "x": 1400, "y": 500 }
    }
  ],
  "edges": [
    {
      "id": "coo_global-vp_sales",
      "source": "coo_global",
      "target": "vp_sales",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#9333ea", "strokeWidth": 3 }
    },
    {
      "id": "coo_global-vp_marketing",
      "source": "coo_global",
      "target": "vp_marketing",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#9333ea", "strokeWidth": 3 }
    },
    {
      "id": "coo_global-dir_customer_success",
      "source": "coo_global",
      "target": "dir_customer_success",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#9333ea", "strokeWidth": 3 }
    },
    {
      "id": "vp_sales-sales_mgr_east",
      "source": "vp_sales",
      "target": "sales_mgr_east",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "vp_sales-sales_mgr_west",
      "source": "vp_sales",
      "target": "sales_mgr_west",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "vp_sales-biz_dev_mgr",
      "source": "vp_sales",
      "target": "biz_dev_mgr",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "vp_marketing-marketing_mgr_digital",
      "source": "vp_marketing",
      "target": "marketing_mgr_digital",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ec4899", "strokeWidth": 2 }
    },
    {
      "id": "vp_marketing-marketing_mgr_product",
      "source": "vp_marketing",
      "target": "marketing_mgr_product",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ec4899", "strokeWidth": 2 }
    },
    {
      "id": "dir_customer_success-cs_mgr",
      "source": "dir_customer_success",
      "target": "cs_mgr",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "sales_mgr_east-sales_rep_east_1",
      "source": "sales_mgr_east",
      "target": "sales_rep_east_1",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "sales_mgr_east-sales_rep_east_2",
      "source": "sales_mgr_east",
      "target": "sales_rep_east_2",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "sales_mgr_east-sales_rep_east_3",
      "source": "sales_mgr_east",
      "target": "sales_rep_east_3",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "sales_mgr_west-sales_rep_west_1",
      "source": "sales_mgr_west",
      "target": "sales_rep_west_1",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "sales_mgr_west-sales_rep_west_2",
      "source": "sales_mgr_west",
      "target": "sales_rep_west_2",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ef4444", "strokeWidth": 2 }
    },
    {
      "id": "marketing_mgr_digital-digital_marketing_spec",
      "source": "marketing_mgr_digital",
      "target": "digital_marketing_spec",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ec4899", "strokeWidth": 2 }
    },
    {
      "id": "marketing_mgr_digital-content_marketing_spec",
      "source": "marketing_mgr_digital",
      "target": "content_marketing_spec",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ec4899", "strokeWidth": 2 }
    },
    {
      "id": "marketing_mgr_product-product_marketing_coord",
      "source": "marketing_mgr_product",
      "target": "product_marketing_coord",
      "type": "smoothstep",
      "animated": true,
      "style": { "stroke": "#ec4899", "strokeWidth": 2 }
    }
  ],
  "flowSettings": {
    "direction": "vertical",
    "spacing": { "x": 200, "y": 150 },
    "autoLayout": true
  }
}'::jsonb, NULL, 'organizational', true, 1);