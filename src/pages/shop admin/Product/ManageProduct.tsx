import { Box, TextField, Button, Typography } from "@mui/material";
import Layout from "../../../components/Layout";

const ManageProduct: React.FC = () => {
   

    return (
        <Layout fullWidth={true}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Správa produktov
                </Typography>
                <Typography variant="body1">
                    Tato stránka je určena pro správu produktov v e-shopu. Z produktů. Zde můžete přidávat, upravovat nebo mazat produkty.
                </Typography>
            </Box>
        </Layout>
    );
};

export default ManageProduct;