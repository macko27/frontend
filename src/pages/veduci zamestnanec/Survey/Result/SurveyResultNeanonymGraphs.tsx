import { Box, Typography, DialogContent, Button, Dialog, DialogTitle, DialogActions } from "@mui/material";
import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Rectangle
} from "recharts";

interface SurveyResultProps {
  survey: any;
}

const SurveyResultNeanonymGraphs: React.FC<SurveyResultProps> = ({ survey }) => {
  const COLORS = ["#66bb6a", "#ffe082", "#ef5350", "#42a5f5"];
  const [selectedOption, setSelectedOption] = useState<{
    answer: string;
    voters: { fullName: string; id: number }[];
  } | null>(null);

  const showVoters = (option: any) => {
    setSelectedOption(option);
  };


  return (
    <DialogContent sx={{ pt: 2 }}>
      {survey?.questions?.map((q: any, index: number) => {
        // pre anonymnú verziu môžeš tu upraviť dáta (napr. skryť mená)
        const options = q.options.map((o: any) => ({ ...o }));

        const isSingle = q.answerType === "single";

        const totalVotes = options.reduce((sum: number, o: any) => sum + o.votes, 0);
        const chartData = options.map((o: any) => ({ name: o.answer, value: o.votes }));

        return (
          <Box key={q.id} sx={{ mb: 5 }}>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              Otázka {index + 1}: {q.question}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" }, // na mobile pod sebou, na desktop vedľa seba
                alignItems: "flex-start",
                gap: 4,
                mt: 2,
              }}
            >
              {/* GRAF + LEGENDA */}
              <Box sx={{ flex: { xs: "1 1 100%", md: "2 2 0" }, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                {/* Graf */}
                <Box sx={{ width: 220, height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {isSingle ? (
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                        >
                          {chartData.map((entry: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 20 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip />
                        <Bar dataKey="value">
                          {chartData.map((entry: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Box>

                {/* Legenda */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {options.map((o: any, i: number) => {
                    const percent = totalVotes === 0 ? 0 : Math.round((o.votes / totalVotes) * 100);
                    return (
                      <Box
                        key={o.id}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", minWidth: 100 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: COLORS[i % COLORS.length],
                              marginRight: 1,
                            }}
                          />
                          <Typography>Odpoveď č.{i+1}</Typography>
                        </Box>

                        <Typography fontWeight="bold" sx={{ minWidth: 40 }}>
                          {percent} %
                        </Typography>

                        <Button
                          onClick={() => showVoters(o)}
                          variant="contained"
                          color="info"
                          sx={{
                            padding: "3px 12px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 500,
                            boxShadow: 2,
                            textTransform: "none",
                            transition: "transform 0.1s",
                            '&:active': { transform: "scale(0.95)" },
                          }}
                        >
                          Zobraziť hlasujúcich
                        </Button>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Vertikálna čiarka a zoznam hlasujúcich */}
              <Box
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 0" },
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 2,
                  mt: { xs: 3, md: 0 }, // odsadenie na mobile
                }}
              >
                {/* Vertikálna čiarka */}
                <Box
                  sx={{
                    width: 2,
                    bgcolor: "grey.400",
                    borderRadius: 1,
                  }}
                />

                {/* Zoznam hlasujúcich */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >

                {selectedOption && (
                <Box
                  sx={{
                    flex: { xs: "1 1 100%", md: "1 1 0" },
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 2,
                    mt: { xs: 3, md: 0 },
                  }}
                >
                  {/* Vertikálna čiarka */}
                  <Box
                    sx={{
                      width: 2,
                      bgcolor: "grey.400",
                      borderRadius: 1,
                    }}
                  />

                  {/* Obsah */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <Typography fontWeight="bold" sx={{ mb: 2 }}>
                      Hlasujúci – {selectedOption.answer}
                    </Typography>

                    <Box
                      sx={{
                        maxHeight: 180,
                        overflowY: "auto",
                        mb: 2,
                      }}
                    >
                      {selectedOption.voters?.length > 0 ? (
                        selectedOption.voters.map((voter) => (
                          <Typography key={voter.id} sx={{ fontSize: 16 }}>
                            {voter.fullName}
                          </Typography>
                        ))
                      ) : (
                        <Typography color="text.secondary">
                          Nikto zatiaľ nehlasoval
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      color="inherit"
                      onClick={() => setSelectedOption(null)}
                      sx={{
                        alignSelf: "flex-start",
                        textTransform: "none",
                      }}
                    >
                      Zavrieť
                    </Button>
                  </Box>
                </Box>
                )}




                </Box>
              </Box>
            </Box>

          </Box>
        );

    

      })}

    </DialogContent>

  );
}

export default SurveyResultNeanonymGraphs;
