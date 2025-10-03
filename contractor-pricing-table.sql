-- Table for contractor pricing data
CREATE TABLE IF NOT EXISTS contractor_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing data
INSERT INTO contractor_pricing (pricing_data, version) VALUES (
  '{
    "material_costs": {
      "resin_types": {
        "epoxy_standard": {"cost_per_sqm": 150, "name": "Żywica epoksydowa standard"},
        "epoxy_premium": {"cost_per_sqm": 250, "name": "Żywica epoksydowa premium"},
        "pu_standard": {"cost_per_sqm": 180, "name": "Żywica poliuretanowa standard"},
        "pu_premium": {"cost_per_sqm": 320, "name": "Żywica poliuretanowa premium"}
      },
      "decorative_effects": {
        "smooth": {"cost_per_sqm": 0, "name": "Gładkie"},
        "flakes": {"cost_per_sqm": 45, "name": "Z płatkami"},
        "marble": {"cost_per_sqm": 85, "name": "Efekt marmuru"},
        "textured": {"cost_per_sqm": 35, "name": "Strukturalne"},
        "transparent": {"cost_per_sqm": 120, "name": "Transparentne"},
        "antistatic": {"cost_per_sqm": 95, "name": "Antystatyczne"}
      },
      "additional_materials": {
        "primer": {"cost_per_sqm": 25, "name": "Gruntowanie"},
        "hardener": {"cost_per_liter": 45, "name": "Utwardzacz"},
        "flakes_material": {"cost_per_kg": 120, "name": "Płatki dekoracyjne"},
        "plastbeton": {"cost_per_kg": 8, "name": "Plastobeton"},
        "mastic": {"cost_per_kg": 12, "name": "Mastic"},
        "foil": {"cost_per_sqm": 5, "name": "Folia ochronna"},
        "tools": {"cost_per_sqm": 15, "name": "Narzędzia jednorazowe"}
      }
    },
    "labor_costs": {
      "substrate_prep": {"cost_per_sqm": 35, "name": "Przygotowanie podłoża", "description": "Czyszczenie, szlifowanie, naprawy"},
      "defect_repair": {"cost_per_sqm": 55, "name": "Naprawa ubytków", "description": "Wypełnianie pęknięć i nierówności"},
      "priming": {"cost_per_sqm": 25, "name": "Gruntowanie", "description": "Aplikacja primera"},
      "resin_application": {"cost_per_sqm": 65, "name": "Aplikacja żywicy", "description": "Nakładanie warstw żywicy"},
      "decoration": {"cost_per_sqm": 45, "name": "Dekoracje", "description": "Efekty dekoracyjne i wykończenie"},
      "stairs_walls": {"cost_per_sqm": 85, "name": "Schody/ściany/cokoły", "description": "Elementy pionowe i schody"}
    },
    "additional_costs": {
      "transport": {"base_cost": 150, "per_km": 3, "name": "Transport materiałów"},
      "waste_disposal": {"cost_per_kg": 2.5, "name": "Wywóz odpadów"},
      "heating_drying": {"cost_per_day": 200, "name": "Nagrzewnice/osuszanie"},
      "line_painting": {"cost_per_meter": 12, "name": "Malowanie linii"},
      "protective_equipment": {"cost_per_person": 50, "name": "Odzież ochronna"},
      "ventilation": {"cost_per_day": 100, "name": "Wentylacja"}
    },
    "schedule_templates": {
      "standard": {
        "stages": {
          "inspection": {"duration_days": 1, "duration_hours": 2, "critical": false},
          "preparation": {"duration_days": 1, "duration_hours": 8, "critical": true},
          "priming": {"duration_days": 1, "duration_hours": 4, "critical": false},
          "application": {"duration_days": 2, "duration_hours": 16, "critical": true},
          "decoration": {"duration_days": 1, "duration_hours": 8, "critical": false},
          "drying": {"duration_days": 3, "duration_hours": 0, "critical": true},
          "final_inspection": {"duration_days": 1, "duration_hours": 2, "critical": false}
        }
      }
    },
    "technical_defaults": {
      "drying_time_hours": 24,
      "curing_time_hours": 72,
      "temperature_range": {"min": 15, "max": 25},
      "humidity_max": 75,
      "warranty_years": 5
    }
  }',
  1
) ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contractor_pricing_version ON contractor_pricing(version);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contractor_pricing_updated_at
  BEFORE UPDATE ON contractor_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
