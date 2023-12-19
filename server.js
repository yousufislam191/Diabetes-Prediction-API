const express = require("express");
const path = require("path");
const multer = require("multer");
const { spawn } = require("node:child_process");

const app = express();
const port = 3000;

// Set up Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  return res.render("form");
});

app.post("/predict-diabetes", upload.none(), async (req, res) => {
  try {
    const formData = req.body;

    // Assuming 'input' is the data you want to send to the Python script
    const input = {
      Pregnancies: parseFloat(formData.Pregnancies),
      Glucose: parseFloat(formData.Glucose),
      BloodPressure: parseFloat(formData.BloodPressure),
      SkinThickness: parseFloat(formData.SkinThickness),
      Insulin: parseFloat(formData.Insulin),
      BMI: parseFloat(formData.BMI),
      DiabetesPedigreeFunction: parseFloat(formData.DiabetesPedigreeFunction),
      Age: parseFloat(formData.Age),
    };

    // Install Python dependencies
    const installDepsProcess = spawn("pip3", [
      "install",
      "scikit-learn",
      "numpy",
      "pandas",
      "streamlit",
    ]);

    installDepsProcess.on("close", (code) => {
      if (code === 0) {
        // Dependencies installed successfully, now run the Python script
        const pythonProcess = spawn("python", [
          "./python_script.py",
          JSON.stringify(input),
        ]);

        pythonProcess.stdout.on("data", (data) => {
          const result = data.toString().trim();
          const message = result.split("\r\n");
          return res.status(200).json(message);
        });

        pythonProcess.stderr.on("data", (data) => {
          //   console.error(`Error: ${data}`);
          return res.status(500).json("Internal Server Error");
        });
      } else {
        // console.error("Error installing Python dependencies");
        return res.status(500).json("Internal Server Error");
      }
    });
  } catch (err) {
    // console.error("Error:", err);
    return res.status(500).json("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
