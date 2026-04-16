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

  const [loading, setLoading] = useState(false);

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
        />

        <TextField
          label="Tel. č."
          required
          fullWidth
          sx={{ mb: 2 }}
          value={form.telefon}
          onChange={handleChange("telefon")}
        />

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