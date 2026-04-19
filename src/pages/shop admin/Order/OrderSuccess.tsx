import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Layout from "../../../components/Layout";

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout fullWidth={true}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          p: 2,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: { xs: 4, md: 7 },
            borderRadius: 3,
            textAlign: "center",
            backgroundImage: "none",
            backgroundColor: "transparent",
            maxWidth: 440,
            width: "100%",
          }}
        >
          {/* Orange check circle */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: "#FF6600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckIcon sx={{ color: "white", fontSize: 36 }} />
          </Box>

          <Typography variant="h6" fontWeight="700" mb={2}>
            Objednávka bola úspešne vytvorená
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={4} lineHeight={1.7}>
            Číslo objednávky: <b>{id}</b>
            <br />
            Stav objednávky môžete sledovať v sekcii Moje objednávky.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/shop/orders")}
            sx={{
              mb: 1.5,
              borderRadius: 999,
              py: 1.5,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              backgroundColor: "#FF6600",
              "&:hover": { backgroundColor: "#e55a00" },
            }}
          >
            Moje objednávky
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/shop")}
            sx={{
              borderRadius: 999,
              py: 1.4,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#FF6600",
              borderColor: "#FF6600",
              "&:hover": {
                borderColor: "#FF6600",
                backgroundColor: "#fff5f0",
              },
            }}
          >
            Návrat do e-shopu
          </Button>
        </Paper>
      </Box>
    </Layout>
  );
};

export default OrderSuccess;