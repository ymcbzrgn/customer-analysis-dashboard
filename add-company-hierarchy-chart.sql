-- Add realistic company hierarchy chart example
-- This shows a real company organizational structure using ReactFlow format

INSERT INTO charts (name, description, config, chart_type, is_public, created_by) VALUES
('TechCorp Organizational Chart', 'Complete company hierarchy showing reporting structure and departmental organization', '{
  "nodes": [
    {
      "id": "ceo",
      "type": "default",
      "position": {"x": 400, "y": 50},
      "data": {
        "label": "Sarah Johnson\nCEO & Founder",
        "role": "Chief Executive Officer",
        "department": "Executive",
        "email": "sarah.johnson@techcorp.com"
      },
      "style": {
        "background": "#1e40af",
        "color": "white",
        "border": "2px solid #1e3a8a",
        "borderRadius": "8px",
        "fontSize": "12px",
        "fontWeight": "bold",
        "width": 180,
        "height": 80
      }
    },
    {
      "id": "cto",
      "type": "default", 
      "position": {"x": 200, "y": 180},
      "data": {
        "label": "Michael Chen\nCTO",
        "role": "Chief Technology Officer",
        "department": "Technology",
        "email": "michael.chen@techcorp.com"
      },
      "style": {
        "background": "#059669",
        "color": "white",
        "border": "2px solid #047857",
        "borderRadius": "8px",
        "fontSize": "12px",
        "fontWeight": "bold",
        "width": 180,
        "height": 80
      }
    },
    {
      "id": "cfo",
      "type": "default",
      "position": {"x": 600, "y": 180},
      "data": {
        "label": "Emma Rodriguez\nCFO",
        "role": "Chief Financial Officer", 
        "department": "Finance",
        "email": "emma.rodriguez@techcorp.com"
      },
      "style": {
        "background": "#dc2626",
        "color": "white",
        "border": "2px solid #b91c1c",
        "borderRadius": "8px",
        "fontSize": "12px",
        "fontWeight": "bold",
        "width": 180,
        "height": 80
      }
    },
    {
      "id": "eng-manager",
      "type": "default",
      "position": {"x": 50, "y": 320},
      "data": {
        "label": "David Kim\nEng Manager",
        "role": "Engineering Manager",
        "department": "Engineering",
        "email": "david.kim@techcorp.com"
      },
      "style": {
        "background": "#0891b2",
        "color": "white",
        "border": "2px solid #0e7490",
        "borderRadius": "8px",
        "fontSize": "11px",
        "width": 160,
        "height": 70
      }
    },
    {
      "id": "product-manager",
      "type": "default",
      "position": {"x": 250, "y": 320},
      "data": {
        "label": "Lisa Wang\nProduct Manager",
        "role": "Product Manager",
        "department": "Product",
        "email": "lisa.wang@techcorp.com"
      },
      "style": {
        "background": "#7c3aed",
        "color": "white",
        "border": "2px solid #6d28d9",
        "borderRadius": "8px",
        "fontSize": "11px",
        "width": 160,
        "height": 70
      }
    },
    {
      "id": "devops-lead",
      "type": "default",
      "position": {"x": 450, "y": 320},
      "data": {
        "label": "Alex Turner\nDevOps Lead",
        "role": "DevOps Team Lead",
        "department": "Infrastructure",
        "email": "alex.turner@techcorp.com"
      },
      "style": {
        "background": "#ea580c",
        "color": "white",
        "border": "2px solid #c2410c",
        "borderRadius": "8px",
        "fontSize": "11px",
        "width": 160,
        "height": 70
      }
    },
    {
      "id": "finance-manager",
      "type": "default",
      "position": {"x": 650, "y": 320},
      "data": {
        "label": "Robert Smith\nFinance Manager",
        "role": "Finance Manager",
        "department": "Finance",
        "email": "robert.smith@techcorp.com"
      },
      "style": {
        "background": "#be123c",
        "color": "white",
        "border": "2px solid #9f1239",
        "borderRadius": "8px",
        "fontSize": "11px",
        "width": 160,
        "height": 70
      }
    },
    {
      "id": "senior-dev-1",
      "type": "default",
      "position": {"x": 0, "y": 460},
      "data": {
        "label": "Jennifer Lee\nSenior Dev",
        "role": "Senior Frontend Developer",
        "department": "Engineering",
        "email": "jennifer.lee@techcorp.com"
      },
      "style": {
        "background": "#0284c7",
        "color": "white",
        "border": "1px solid #0369a1",
        "borderRadius": "6px",
        "fontSize": "10px",
        "width": 140,
        "height": 60
      }
    },
    {
      "id": "senior-dev-2",
      "type": "default",
      "position": {"x": 160, "y": 460},
      "data": {
        "label": "Carlos Martinez\nSenior Dev",
        "role": "Senior Backend Developer",
        "department": "Engineering", 
        "email": "carlos.martinez@techcorp.com"
      },
      "style": {
        "background": "#0284c7",
        "color": "white",
        "border": "1px solid #0369a1",
        "borderRadius": "6px",
        "fontSize": "10px",
        "width": 140,
        "height": 60
      }
    },
    {
      "id": "junior-dev",
      "type": "default",
      "position": {"x": 80, "y": 560},
      "data": {
        "label": "Mark Johnson\nJunior Dev",
        "role": "Junior Full-Stack Developer",
        "department": "Engineering",
        "email": "mark.johnson@techcorp.com"
      },
      "style": {
        "background": "#0ea5e9",
        "color": "white",
        "border": "1px solid #0284c7",
        "borderRadius": "6px",
        "fontSize": "10px",
        "width": 140,
        "height": 60
      }
    },
    {
      "id": "ui-designer",
      "type": "default",
      "position": {"x": 300, "y": 460},
      "data": {
        "label": "Sophie Chen\nUI Designer",
        "role": "UI/UX Designer",
        "department": "Product",
        "email": "sophie.chen@techcorp.com"
      },
      "style": {
        "background": "#8b5cf6",
        "color": "white",
        "border": "1px solid #7c3aed",
        "borderRadius": "6px", 
        "fontSize": "10px",
        "width": 140,
        "height": 60
      }
    },
    {
      "id": "devops-engineer",
      "type": "default",
      "position": {"x": 480, "y": 460},
      "data": {
        "label": "Ahmed Hassan\nDevOps Engineer",
        "role": "Cloud Infrastructure Engineer",
        "department": "Infrastructure",
        "email": "ahmed.hassan@techcorp.com"
      },
      "style": {
        "background": "#f97316",
        "color": "white",
        "border": "1px solid #ea580c",
        "borderRadius": "6px",
        "fontSize": "10px",
        "width": 140,
        "height": 60
      }
    },
    {
      "id": "accountant",
      "type": "default",
      "position": {"x": 680, "y": 460},
      "data": {
        "label": "Maria Garcia\nAccountant",
        "role": "Senior Accountant",
        "department": "Finance",
        "email": "maria.garcia@techcorp.com"
      },
      "style": {
        "background": "#e11d48",
        "color": "white",
        "border": "1px solid #be123c",
        "borderRadius": "6px",
        "fontSize": "10px",
        "width": 140,
        "height": 60
      }
    }
  ],
  "edges": [
    {
      "id": "ceo-cto",
      "source": "ceo",
      "target": "cto",
      "type": "smoothstep",
      "style": {"stroke": "#1e40af", "strokeWidth": 3},
      "markerEnd": {"type": "arrowclosed", "color": "#1e40af"}
    },
    {
      "id": "ceo-cfo", 
      "source": "ceo",
      "target": "cfo",
      "type": "smoothstep",
      "style": {"stroke": "#1e40af", "strokeWidth": 3},
      "markerEnd": {"type": "arrowclosed", "color": "#1e40af"}
    },
    {
      "id": "cto-eng-manager",
      "source": "cto",
      "target": "eng-manager",
      "type": "smoothstep", 
      "style": {"stroke": "#059669", "strokeWidth": 2},
      "markerEnd": {"type": "arrowclosed", "color": "#059669"}
    },
    {
      "id": "cto-product-manager",
      "source": "cto",
      "target": "product-manager",
      "type": "smoothstep",
      "style": {"stroke": "#059669", "strokeWidth": 2},
      "markerEnd": {"type": "arrowclosed", "color": "#059669"}
    },
    {
      "id": "cto-devops-lead",
      "source": "cto",
      "target": "devops-lead",
      "type": "smoothstep",
      "style": {"stroke": "#059669", "strokeWidth": 2},
      "markerEnd": {"type": "arrowclosed", "color": "#059669"}
    },
    {
      "id": "cfo-finance-manager",
      "source": "cfo",
      "target": "finance-manager",
      "type": "smoothstep",
      "style": {"stroke": "#dc2626", "strokeWidth": 2},
      "markerEnd": {"type": "arrowclosed", "color": "#dc2626"}
    },
    {
      "id": "eng-manager-senior-dev-1",
      "source": "eng-manager",
      "target": "senior-dev-1",
      "type": "smoothstep",
      "style": {"stroke": "#0891b2", "strokeWidth": 1.5},
      "markerEnd": {"type": "arrowclosed", "color": "#0891b2"}
    },
    {
      "id": "eng-manager-senior-dev-2",
      "source": "eng-manager", 
      "target": "senior-dev-2",
      "type": "smoothstep",
      "style": {"stroke": "#0891b2", "strokeWidth": 1.5},
      "markerEnd": {"type": "arrowclosed", "color": "#0891b2"}
    },
    {
      "id": "senior-dev-1-junior-dev",
      "source": "senior-dev-1",
      "target": "junior-dev",
      "type": "smoothstep",
      "style": {"stroke": "#0284c7", "strokeWidth": 1},
      "markerEnd": {"type": "arrowclosed", "color": "#0284c7"}
    },
    {
      "id": "senior-dev-2-junior-dev",
      "source": "senior-dev-2",
      "target": "junior-dev",
      "type": "smoothstep",
      "style": {"stroke": "#0284c7", "strokeWidth": 1},
      "markerEnd": {"type": "arrowclosed", "color": "#0284c7"}
    },
    {
      "id": "product-manager-ui-designer",
      "source": "product-manager",
      "target": "ui-designer",
      "type": "smoothstep",
      "style": {"stroke": "#7c3aed", "strokeWidth": 1.5},
      "markerEnd": {"type": "arrowclosed", "color": "#7c3aed"}
    },
    {
      "id": "devops-lead-devops-engineer",
      "source": "devops-lead",
      "target": "devops-engineer",
      "type": "smoothstep",
      "style": {"stroke": "#ea580c", "strokeWidth": 1.5},
      "markerEnd": {"type": "arrowclosed", "color": "#ea580c"}
    },
    {
      "id": "finance-manager-accountant",
      "source": "finance-manager",
      "target": "accountant",
      "type": "smoothstep",
      "style": {"stroke": "#be123c", "strokeWidth": 1.5},
      "markerEnd": {"type": "arrowclosed", "color": "#be123c"}
    }
  ],
  "viewport": {
    "x": 0,
    "y": 0,
    "zoom": 0.8
  }
}', 'bar', true, 1);