import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../../../hooks/SnackBarContext";
import api from "../../../../app/api";

import CartSummary from "./CartSummary";
import { useCart } from "../CartContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTheme } from "@mui/material/styles";

interface AddressFormProps {
  totalItems: number;
  totalPoints: number;
  availablePoints: number;
  remaining: number;
  onBack: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  totalItems,
  totalPoints,
  availablePoints,
  remaining,
  onBack,
}) => {
  const navigate = useNavigate();
  const { items, clearCart, setPointsBalance } = useCart();
  const { openSnackbar } = useSnackbar();
  const [creator, setCreator] = useState<any>(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    psc: "",
    telefon: "",
    cisloDomu: "",
  });

  const [form, setForm] = useState({
    ulica: "",
    cisloDomu: "",
    city: "",
    psc: "",
    telefon: "",
    poznamka: "",
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };


  const validate = () => {
    let valid = true;
    const newErrors = { psc: "", telefon: "", cisloDomu: "" };

    // PSČ – presne 5 číslic
    if (!/^\d{5}$/.test(form.psc)) {
      newErrors.psc = "PSČ musí mať 5 číslic";
      valid = false;
    }

    // Telefón – kontrola podľa predvoľby krajiny
    const phoneValidation: Record<string, { regex: RegExp; hint: string }> = {
      "421": { regex: /^4219\d{8}$/, hint: "SK: +421 9XX XXX XXX" },
      "420": { regex: /^4206?\d{8}$/, hint: "CZ: +420 XXX XXX XXX" },
    };

    const matchedCountry = Object.keys(phoneValidation).find((prefix) =>
      form.telefon.startsWith(prefix)
    );

    if (!matchedCountry || !phoneValidation[matchedCountry].regex.test(form.telefon)) {
      newErrors.telefon = `Neplatné telefónne číslo (${
        matchedCountry ? phoneValidation[matchedCountry].hint : "neznáma krajina"
      })`;
      valid = false;
    }

    // Číslo domu – len číslo
    if (!/^\d+$/.test(form.cisloDomu)) {
      newErrors.cisloDomu = "Číslo domu musí byť číslo";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (
      !form.ulica ||
      !form.cisloDomu ||
      !form.city ||
      !form.psc ||
      !form.telefon
    ) {
      openSnackbar("Vyplň všetky povinné polia", 'error');
      return;
    }

     if (!validate()) {
      return;
    }

    if (remaining < 0) {
      openSnackbar("Nemáš dostatok bodov", 'error');
      return;
    }

    try {
        setLoading(true);

        const payload = {
            zakaznik: creator?.employeeId,
            ulica: form.ulica,
            cisloDomu: Number(form.cisloDomu),
            city: form.city,
            psc: form.psc,
            telefon: form.telefon,
            poznamka: form.poznamka,
            produkty: items.map((i) => ({
            productId: i.id,
            mnozstvo: i.quantity,
            })),
        };

        const res = await api.post("/Shop/CreateOrder", payload);

        //1.vycistenie kosika
        clearCart();

        //2. refresh bodov
        const updatedUser = await api.get("/EmployeeCard/GetEmployeeCardLoggedIn/");
        setPointsBalance(updatedUser.data.points);

        //3. presmerovanie
        navigate(`/shop/order-success/${res.data.orderId}`);
    } catch (err) {
      console.error(err);
      openSnackbar("Chyba pri vytváraní objednávky", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
    .then(res => setCreator(res.data))
    .catch(() => openSnackbar('Nepodarilo sa načítať údaje používateľa', 'error'));
}, []);

  return (
    <Box display="flex" gap={4} flexDirection={{ xs: "column", md: "row" }}>
      
      {/* LEFT */}
      <Box flex={2}>
        <Typography variant="h5" mb={2}>
          Adresa doručenia
        </Typography>

        <TextField
          label="Ulica"
          required
          fullWidth
          sx={{ mb: 2 }}
          value={form.ulica}
          onChange={handleChange("ulica")}
        />

        <TextField
          label="Číslo domu/bytu"
          required
          fullWidth
          sx={{ mb: 2 }}
          value={form.cisloDomu}
          onChange={handleChange("cisloDomu")}
          error={!!errors.cisloDomu}
          helperText={errors.cisloDomu}
        />

        <TextField
          label="Mesto"
          required
          fullWidth
          sx={{ mb: 2 }}
          value={form.city}
          onChange={handleChange("city")}
        />

        <TextField
          label="PSČ"
          required
          fullWidth
          sx={{ mb: 2 }}
          value={form.psc}
          onChange={handleChange("psc")}
          error={!!errors.psc}
          helperText={errors.psc}
        />

        <Box
          sx={{
            mb: 2,
            "& .react-tel-input .form-control:focus": {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
            },
            "& .react-tel-input .flag-dropdown": {
              backgroundColor: theme.palette.background.default,
              borderColor: isDark ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)",
            },
            "& .react-tel-input .flag-dropdown:hover": {
              backgroundColor: isDark ? "#2c2c2c" : "#f5f5f5",
            },
            "& .react-tel-input .flag-dropdown.open": {
              backgroundColor: `${theme.palette.background.default} !important`,
            },
            "& .react-tel-input .flag-dropdown.open .selected-flag": {
              backgroundColor: `${theme.palette.background.default} !important`,
            },
            "& .react-tel-input .selected-flag": {
              backgroundColor: `${theme.palette.background.default} !important`,
            },
            "& .react-tel-input .selected-flag:hover": {
              backgroundColor: `${isDark ? "#2c2c2c" : "#f5f5f5"} !important`,
            },
            "& .react-tel-input .selected-flag:focus": {
              backgroundColor: `${theme.palette.background.default} !important`,
            },
            "& .react-tel-input .country-list .country:hover": {
              backgroundColor: isDark ? "#2c2c2c" : "#f5f5f5",
            },
            "& .react-tel-input .country-list .country.highlight": {
              backgroundColor: isDark ? "#3a3a3a" : "#e8e8e8",
            },
          }}
        >
          <PhoneInput
            country={"sk"}
            onlyCountries={["sk", "cz"]}
            value={form.telefon}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                telefon: value,
              }))
            }
            inputStyle={{
              width: "100%",
              height: "56px",
              fontSize: "16px",
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)"}`,
            }}
            buttonStyle={{
              borderTopLeftRadius: "4px",
              borderBottomLeftRadius: "4px",
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)"}`,
            }}
            dropdownStyle={{
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
            }}
            specialLabel="Tel. č."
          />
          {errors.telefon && (
            <Typography color="error" fontSize={12}>
              {errors.telefon}
            </Typography>
          )}
        </Box>

        <TextField
          label="Poznámka"
          multiline
          rows={4}
          fullWidth
          value={form.poznamka}
          onChange={handleChange("poznamka")}
        />

        <Button
          variant="contained"
          onClick={onBack}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          Späť do košíka
        </Button>
      </Box>

      {/* RIGHT */}
      <CartSummary
        totalItems={totalItems}
        totalPoints={totalPoints}
        availablePoints={availablePoints}
        remaining={remaining}
        buttonLabel={loading ? "Odosielam..." : "Potvrdiť objednávku"}
        onAction={handleSubmit}
      />
    </Box>
  );
};

export default AddressForm;