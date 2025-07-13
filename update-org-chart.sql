-- Update the Company Organizational Chart with proper organizational data
UPDATE charts 
SET 
  chart_type = 'organizational',
  config = '{
    "type": "organizational",
    "display": {
      "title": "Company Organizational Chart"
    },
    "nodes": [
      {
        "id": "ceo",
        "type": "employee",
        "data": {
          "label": "Sarah Johnson",
          "sublabel": "Chief Executive Officer",
          "department": "Executive",
          "level": 1,
          "email": "sarah.johnson@company.com",
          "phone": "+1 555 0101",
          "employeeId": "EMP001",
          "avatar": "SJ"
        },
        "position": { "x": 400, "y": 50 }
      },
      {
        "id": "cto",
        "type": "employee",
        "data": {
          "label": "Michael Chen",
          "sublabel": "Chief Technology Officer",
          "department": "Technology",
          "level": 2,
          "email": "michael.chen@company.com",
          "employeeId": "EMP002",
          "avatar": "MC",
          "reportsTo": "ceo"
        },
        "position": { "x": 200, "y": 200 }
      },
      {
        "id": "cfo",
        "type": "employee",
        "data": {
          "label": "Jessica Williams",
          "sublabel": "Chief Financial Officer", 
          "department": "Finance",
          "level": 2,
          "email": "jessica.williams@company.com",
          "employeeId": "EMP003",
          "avatar": "JW",
          "reportsTo": "ceo"
        },
        "position": { "x": 600, "y": 200 }
      },
      {
        "id": "eng_mgr",
        "type": "employee",
        "data": {
          "label": "Robert Davis",
          "sublabel": "Engineering Manager",
          "department": "Engineering",
          "level": 3,
          "email": "robert.davis@company.com",
          "employeeId": "EMP004",
          "avatar": "RD",
          "reportsTo": "cto"
        },
        "position": { "x": 100, "y": 350 }
      },
      {
        "id": "dev_lead",
        "type": "employee",
        "data": {
          "label": "Emily Rodriguez",
          "sublabel": "Development Lead",
          "department": "Engineering",
          "level": 3,
          "email": "emily.rodriguez@company.com",
          "employeeId": "EMP005",
          "avatar": "ER",
          "reportsTo": "cto"
        },
        "position": { "x": 300, "y": 350 }
      },
      {
        "id": "finance_mgr",
        "type": "employee",
        "data": {
          "label": "David Kim",
          "sublabel": "Finance Manager",
          "department": "Finance",
          "level": 3,
          "email": "david.kim@company.com",
          "employeeId": "EMP006",
          "avatar": "DK",
          "reportsTo": "cfo"
        },
        "position": { "x": 500, "y": 350 }
      },
      {
        "id": "accountant",
        "type": "employee",
        "data": {
          "label": "Lisa Thompson",
          "sublabel": "Senior Accountant",
          "department": "Finance",
          "level": 4,
          "email": "lisa.thompson@company.com",
          "employeeId": "EMP007",
          "avatar": "LT",
          "reportsTo": "finance_mgr"
        },
        "position": { "x": 500, "y": 500 }
      },
      {
        "id": "dev1",
        "type": "employee",
        "data": {
          "label": "Alex Martinez",
          "sublabel": "Senior Developer",
          "department": "Engineering",
          "level": 4,
          "email": "alex.martinez@company.com",
          "employeeId": "EMP008",
          "avatar": "AM",
          "reportsTo": "dev_lead"
        },
        "position": { "x": 250, "y": 500 }
      },
      {
        "id": "dev2",
        "type": "employee",
        "data": {
          "label": "Maria Garcia",
          "sublabel": "Frontend Developer",
          "department": "Engineering",
          "level": 4,
          "email": "maria.garcia@company.com",
          "employeeId": "EMP009",
          "avatar": "MG",
          "reportsTo": "dev_lead"
        },
        "position": { "x": 350, "y": 500 }
      }
    ],
    "edges": [
      {
        "id": "ceo-cto",
        "source": "ceo",
        "target": "cto",
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#3b82f6", "strokeWidth": 2 }
      },
      {
        "id": "ceo-cfo", 
        "source": "ceo",
        "target": "cfo",
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#3b82f6", "strokeWidth": 2 }
      },
      {
        "id": "cto-eng_mgr",
        "source": "cto",
        "target": "eng_mgr",
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#10b981", "strokeWidth": 2 }
      },
      {
        "id": "cto-dev_lead",
        "source": "cto",
        "target": "dev_lead", 
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#10b981", "strokeWidth": 2 }
      },
      {
        "id": "cfo-finance_mgr",
        "source": "cfo",
        "target": "finance_mgr",
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#f59e0b", "strokeWidth": 2 }
      },
      {
        "id": "finance_mgr-accountant",
        "source": "finance_mgr",
        "target": "accountant",
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#f59e0b", "strokeWidth": 2 }
      },
      {
        "id": "dev_lead-dev1",
        "source": "dev_lead",
        "target": "dev1",
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#10b981", "strokeWidth": 2 }
      },
      {
        "id": "dev_lead-dev2",
        "source": "dev_lead",
        "target": "dev2",
        "type": "smoothstep",
        "animated": true,
        "style": { "stroke": "#10b981", "strokeWidth": 2 }
      }
    ],
    "flowSettings": {
      "direction": "vertical",
      "spacing": { "x": 200, "y": 150 },
      "autoLayout": true
    }
  }'::jsonb
WHERE name = 'Company Organizational Chart';