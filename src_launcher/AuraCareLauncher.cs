using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace AuraCareHMS
{
    public class MainForm : Form
    {
        private Label lblTitle;
        private Label lblSubtitle;
        private Label lblStatus;
        private Button btnOpenDashboard;
        private Button btnOpenReception;
        private Button btnOpenConsultancy;
        private Button btnOpenGoogleSheet;
        private Button btnOpenDataFolder;
        private Button btnExit;
        private Panel headerPanel;
        private Process serverProcess = null;
        private System.Windows.Forms.Timer statusTimer;

        private const string AppUrl = "http://localhost:3000";
        private const string ReceptionUrl = "http://localhost:3000/reception";
        private const string ConsultancyUrl = "http://localhost:3000/consultancy";
        private const string GoogleSheetUrl = "https://docs.google.com/spreadsheets/d/1iSKffKlj5FJ91Z-re3WvnX76cXBCMQTc2ImcO7RRJew/edit";
        private const string DataFolderPath = @"C:\Users\hp\Desktop\Ready Reference\Hospital mgmt sys data";

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }

        public MainForm()
        {
            this.Text = "AuraCare Hospital Management System";
            this.Size = new Size(580, 520);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(248, 250, 252); // Slate-50

            // Set Form Icon if present
            try
            {
                string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app_icon.ico");
                if (!File.Exists(iconPath))
                {
                    iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "public", "app_icon.ico");
                }
                if (File.Exists(iconPath))
                {
                    this.Icon = new Icon(iconPath);
                }
            }
            catch { }

            // Header Panel (Emerald Gradient-like color)
            headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 110;
            headerPanel.BackColor = Color.FromArgb(6, 78, 59); // Emerald-900

            lblTitle = new Label();
            lblTitle.Text = "AuraCare Hospital Management System";
            lblTitle.Font = new Font("Segoe UI", 16, FontStyle.Bold);
            lblTitle.ForeColor = Color.White;
            lblTitle.AutoSize = true;
            lblTitle.Location = new Point(24, 22);

            lblSubtitle = new Label();
            lblSubtitle.Text = "Windows Launcher & Control Center | All Modules Active";
            lblSubtitle.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblSubtitle.ForeColor = Color.FromArgb(167, 243, 208); // Emerald-200
            lblSubtitle.AutoSize = true;
            lblSubtitle.Location = new Point(26, 62);

            headerPanel.Controls.Add(lblTitle);
            headerPanel.Controls.Add(lblSubtitle);
            this.Controls.Add(headerPanel);

            // Status Label
            lblStatus = new Label();
            lblStatus.Text = "Checking local HMS server status...";
            lblStatus.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            lblStatus.ForeColor = Color.FromArgb(15, 118, 110);
            lblStatus.Location = new Point(28, 130);
            lblStatus.Size = new Size(520, 30);
            this.Controls.Add(lblStatus);

            // Action Buttons
            int btnTop = 175;
            int btnHeight = 44;
            int spacing = 12;

            btnOpenDashboard = CreateStyledButton("🌐  Open Hospital Dashboard in Browser", 28, btnTop, Color.FromArgb(5, 150, 105), Color.White);
            btnOpenDashboard.Click += (s, e) => LaunchUrl(AppUrl);
            this.Controls.Add(btnOpenDashboard);

            btnTop += btnHeight + spacing;
            btnOpenReception = CreateStyledButton("📸  Open Reception Desk (Patient Camera Intake)", 28, btnTop, Color.FromArgb(13, 148, 136), Color.White);
            btnOpenReception.Click += (s, e) => LaunchUrl(ReceptionUrl);
            this.Controls.Add(btnOpenReception);

            btnTop += btnHeight + spacing;
            btnOpenConsultancy = CreateStyledButton("📅  Open Consultancy Slots & Booking Platform", 28, btnTop, Color.FromArgb(14, 165, 233), Color.White);
            btnOpenConsultancy.Click += (s, e) => LaunchUrl(ConsultancyUrl);
            this.Controls.Add(btnOpenConsultancy);

            btnTop += btnHeight + spacing;
            btnOpenGoogleSheet = CreateStyledButton("📊  Open Linked Google Spreadsheet (PatientsRecord)", 28, btnTop, Color.FromArgb(71, 85, 105), Color.White);
            btnOpenGoogleSheet.Click += (s, e) => LaunchUrl(GoogleSheetUrl);
            this.Controls.Add(btnOpenGoogleSheet);

            btnTop += btnHeight + spacing;
            btnOpenDataFolder = CreateStyledButton("📂  Open Data Package Directory", 28, btnTop, Color.FromArgb(100, 116, 139), Color.White);
            btnOpenDataFolder.Click += (s, e) => OpenDataFolder();
            this.Controls.Add(btnOpenDataFolder);

            // Start or verify server and launch browser
            this.Load += MainForm_Load;

            // Periodic status checker
            statusTimer = new System.Windows.Forms.Timer();
            statusTimer.Interval = 3000;
            statusTimer.Tick += (s, e) => CheckServerStatus();
            statusTimer.Start();
        }

        private Button CreateStyledButton(string text, int x, int y, Color bgColor, Color fgColor)
        {
            Button btn = new Button();
            btn.Text = text;
            btn.Location = new Point(x, y);
            btn.Size = new Size(510, 44);
            btn.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            btn.BackColor = bgColor;
            btn.ForeColor = fgColor;
            btn.FlatStyle = FlatStyle.Flat;
            btn.FlatAppearance.BorderSize = 0;
            btn.Cursor = Cursors.Hand;
            return btn;
        }

        private void MainForm_Load(object sender, EventArgs e)
        {
            Thread t = new Thread(EnsureServerAndLaunch);
            t.IsBackground = true;
            t.Start();
        }

        private void EnsureServerAndLaunch()
        {
            bool isRunning = IsServerResponding();
            if (!isRunning)
            {
                UpdateStatus("Starting Next.js HMS server on port 3000...", Color.FromArgb(180, 83, 9));
                StartServerProcess();

                // Wait up to 15 seconds for server to respond
                for (int i = 0; i < 30; i++)
                {
                    Thread.Sleep(500);
                    if (IsServerResponding())
                    {
                        isRunning = true;
                        break;
                    }
                }
            }

            if (isRunning)
            {
                UpdateStatus("● System Online: http://localhost:3000", Color.FromArgb(5, 150, 105));
                LaunchUrl(AppUrl);
            }
            else
            {
                UpdateStatus("Server starting in background. Click button below to open.", Color.FromArgb(180, 83, 9));
            }
        }

        private void StartServerProcess()
        {
            try
            {
                string projectDir = AppDomain.CurrentDomain.BaseDirectory;
                // If run from a subfolder, search up
                if (!File.Exists(Path.Combine(projectDir, "package.json")))
                {
                    string candidate = @"C:\Users\hp\.gemini\antigravity\scratch\clinic-hms";
                    if (File.Exists(Path.Combine(candidate, "package.json")))
                    {
                        projectDir = candidate;
                    }
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "cmd.exe";
                psi.Arguments = "/c npm run dev";
                psi.WorkingDirectory = projectDir;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = true;

                serverProcess = Process.Start(psi);
            }
            catch (Exception ex)
            {
                UpdateStatus("Notice: " + ex.Message, Color.Red);
            }
        }

        private bool IsServerResponding()
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(AppUrl);
                request.Timeout = 1500;
                request.Method = "HEAD";
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                try
                {
                    HttpWebRequest request2 = (HttpWebRequest)WebRequest.Create(AppUrl);
                    request2.Timeout = 1500;
                    request2.Method = "GET";
                    using (HttpWebResponse response2 = (HttpWebResponse)request2.GetResponse())
                    {
                        return response2.StatusCode == HttpStatusCode.OK;
                    }
                }
                catch { return false; }
            }
        }

        private void CheckServerStatus()
        {
            if (IsServerResponding())
            {
                lblStatus.Text = "● System Online: http://localhost:3000 (All modules ready)";
                lblStatus.ForeColor = Color.FromArgb(5, 150, 105);
            }
            else
            {
                lblStatus.Text = "○ Connecting to localhost:3000...";
                lblStatus.ForeColor = Color.FromArgb(180, 83, 9);
            }
        }

        private void UpdateStatus(string message, Color color)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => UpdateStatus(message, color)));
                return;
            }
            lblStatus.Text = message;
            lblStatus.ForeColor = color;
        }

        private void LaunchUrl(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Could not launch URL: " + ex.Message, "Launch Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OpenDataFolder()
        {
            try
            {
                if (Directory.Exists(DataFolderPath))
                {
                    Process.Start("explorer.exe", DataFolderPath);
                }
                else
                {
                    Process.Start("explorer.exe", AppDomain.CurrentDomain.BaseDirectory);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error opening folder: " + ex.Message);
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (statusTimer != null)
            {
                statusTimer.Stop();
                statusTimer.Dispose();
            }
            base.OnFormClosing(e);
        }
    }
}
