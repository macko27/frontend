import { Box, Typography, DialogContent, Divider } from "@mui/material";
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
  LabelList
} from "recharts";

const COLORS = ["#66bb6a", "#ffe082", "#ef5350", "#42a5f5"];

interface SurveyResultProps {
  survey: any;
}

const SurveyResultAnonymGraphs: React.FC<SurveyResultProps> = ({ survey }) => {
  return (
    <DialogContent sx={{ pt: 2 }}>
      {survey?.questions?.map((q: any, index: number) => {
        // pre anonymnú verziu môžeš tu upraviť dáta (napr. skryť mená)
        const options = q.options.map((o: any) => ({ ...o }));

        const isSingle = q.answerType === "single";

        const totalVotes = options.reduce((sum: number, o: any) => sum + o.votes, 0);
        const chartData = options.map((o: any) => ({ name: o.answer, value: o.votes }));

        return (
          
          <Box key={q.id} 
            sx={{ 
              mb: 5, 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              flexDirection: "column",
            }}>

            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography fontWeight="bold" sx={{ textAlign: "left" }}>
                Otázka {index + 1}: {q.question}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "center",
                alignItems: "center",
              }}
            >

              {/* GRAF PODĽA TYPU OTÁZKY */}
              <Box sx={{ width: 220, height: 220 }}>
                <ResponsiveContainer width="100%" height={220}>
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
                          <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" hide/>
                      <YAxis type="category" dataKey="name" hide/>
                      <Tooltip />
                      <Bar dataKey="value">
                        {chartData.map((entry: any, i: number) => (
                          <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="right"
                            formatter={(val) => `${val}`} // alebo `${val}%` ak chceš percentá
                            style={{ fill: "black", fontWeight: "bold" }}
                        />
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Box>

              {/* Legenda */}
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: 5, marginLeft: 5 }}>
                {options.map((o: any, i: number) => {
                  const percent =
                    totalVotes === 0 ? 0 : Math.round((o.votes / totalVotes) * 100);
                  return (
                    <Box
                      key={o.id}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        mb: 1.2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", minWidth: 100 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: COLORS[i % COLORS.length],
                            marginRight: 1
                          }}
                        />
                        <Typography>Odpoveď č.{i+1}</Typography>
                      </Box>

                      {isSingle && ( 
                        <Box sx={{ ml: 4 }}>
                          <Typography fontWeight="bold">{percent} %</Typography>
                        </Box>
                      )}

                      
                    </Box>
                  );
                })}
              </Box>

            </Box>
            
              {/* Divider medzi otázkami (okrem poslednej) */}
              {index < survey.questions.length - 1 && (
                <Divider 
                  sx={{ 
                    width: "calc(100% + 32px)", // predpokladám padding 16px na každej strane
                    marginLeft: "-16px",        // vyrovnáme padding
                    marginRight: "-16px",
                    mt: 3,
                    mb: 3,
                    borderColor: "grey.400"    // tmavšia farba ak chceš
                  }} 
                />
              )}
          </Box>
        );
      })}
    </DialogContent>
  );
}

export default SurveyResultAnonymGraphs;
