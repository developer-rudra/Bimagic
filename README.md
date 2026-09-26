# Bimagic 🪄

> An interactive, highly visual CLI wrapper around Git.

Bimagic reduces the complexity of everyday Git usage without replacing Git itself. Instead of requiring users to memorize complex Git syntax, flags, and switches, Bimagic provides interactive terminal menus to perform everyday Git operations using simple arrow keys and Enter.

---

## 🌟 Why Bimagic?

* **Zero Syntax Guesswork:** Perform commits, branch switches, stashes, and pushes without memorizing flags.
* **Magic Conventional Commits:** Guided, standard-compliant conventional commit message builder.
* **Visual Repository Dashboard:** Live view of modified, staged, untracked, ahead/behind files, remote, and commit history.
* **Interactive Staging & Safety Guardrails:** Prevents accidental staging of `.env` or sensitive files, with explicit safety confirmation before destructive actions.
* **Friendly Git Error Handling:** Translates confusing Git output into human-readable explanations with actionable recommendations.
* **Sparse Checkout Cloning:** Download only specific project subdirectories without cloning entire massive monorepos.

---

## 📦 Installation

### Global Installation via npm

```bash
npm install -g bimagic
```

Then run anywhere in your terminal:

```bash
bimagic
```

### Direct Execution with npx

```bash
npx bimagic
```

---

## 🚀 Quick Start & Usage

### 1. Launch Interactive Mode

Simply type `bimagic` in any terminal:

```bash
bimagic
```

Bimagic automatically detects whether your current working directory is a Git repository:
* **Inside a Git Repository:** Opens the main interactive dashboard with live repository details.
* **Outside a Git Repository:** Prompts you to browse folders, select recent repositories, initialize a new repo, or clone a remote project.

---

## ⚡ Direct CLI Commands

Besides the primary interactive mode, Bimagic supports direct CLI subcommands:

| Command | Description |
|---|---|
| `bimagic` | Launches primary interactive dashboard loop |
| `bimagic status` | View detailed status dashboard |
| `bimagic commit` | Open guided Magic Conventional Commit builder |
| `bimagic branch` | Open branch management (list, create, switch, merge, delete, rename) |
| `bimagic stash` | Open stash management (create, view diff, apply, pop, drop, clear) |
| `bimagic push` | Push current branch changes to remote |
| `bimagic pull` | Pull remote changes into current branch |
| `bimagic clone` | Interactively clone repository or configure sparse checkout |
| `bimagic config` | Manage Bimagic settings and recent repositories |
| `bimagic --version` | Output installed version |
| `bimagic --help` | Show command line help |

---

## ✨ Key Features & Walkthrough

### 📊 1. Repository Status Dashboard
Provides a complete visual snapshot of your working tree:
* Current branch, HEAD commit hash, and remote tracking details
* File counters (Staged, Modified, Untracked, Deleted)
* Local vs Remote sync status (Ahead / Behind commit count)
* Last commit info (hash, message, author, timestamp)

### ➕ 2. Interactive Staging
* Checkbox menu for selecting specific files to stage or unstage.
* Bulk stage all / unstage all support.
* **Built-in Security Safeguard:** Automatically detects sensitive files (e.g. `.env`, `credentials.json`, `id_rsa`) and requires explicit double-confirmation before staging.

### 🪄 3. Magic Conventional Commit Builder
Guides you through building standard Conventional Commits:
1. **Type Selection:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
2. **Optional Scope:** e.g., `auth`, `ui`, `api`.
3. **Description:** Clear, validated subject line.
4. **Breaking Changes & Issues:** Optional breaking change note and issue closer.
5. **Live Preview & Validation:** Previews final format `type(scope): description` before executing commit.

### 🌿 4. Branch Management
* **List:** View all local branches with current active branch indicator.
* **Create & Switch:** Create a new branch and automatically switch to it.
* **Switch:** Seamlessly switch between branches.
* **Merge:** Interactively select and merge branches into your current HEAD.
* **Delete & Rename:** Rename or delete branches with safety confirmations for unmerged changes.

### 📦 5. Stash Management
* **Save:** Quickly stash dirty working directory changes with custom descriptions.
* **View Diff:** Inspect stashed file contents before applying.
* **Apply / Pop / Drop:** Apply, pop, or drop individual stashes safely.
* **Clear All:** Clear all stashes with multi-step safety verification.

### 🌐 6. Interactive Clone & Sparse Checkout
* **Full Clone:** Clone any remote repository into a target directory.
* **Sparse Clone:** Choose specific subdirectories (e.g., `frontend`, `docs`) to download without cloning unnecessary project assets.

---

## ⚙️ Configuration (`~/.bimagicrc.json`)

Bimagic saves non-sensitive local settings in your home directory:
* **Recent Repositories:** Remembers recently accessed repositories (up to 10).
* **Confirm Destructive Actions:** Enables or disables confirmation prompts for destructive operations.
* **Default Remote:** Configurable remote name (defaults to `origin`).

*Note: Bimagic NEVER stores sensitive credentials, tokens, or SSH keys.*

---

## 🏗️ Architecture

```
src/
├── index.ts              # Shebang entry point
├── cli/                  # Commander CLI definition & commands
│   └── menus/            # Interactive prompt screens (Inquirer)
├── core/
│   ├── config/           # ConfigManager (Zod + local JSON storage)
│   ├── git/              # GitService (wrapper around simple-git)
│   └── repository/       # RepositoryManager
├── ui/
│   └── components/       # Safety prompts & Ora spinners
├── utils/
│   ├── errors/           # Centralized Git error classifier
│   ├── logger/           # Chalk terminal formatting & banner
│   └── validation/       # Zod commit schema validator
└── types/                # TypeScript interface definitions
```

---

## 🧪 Development & Testing

### Prerequisites
* Node.js >= 18.0.0
* Git installed locally

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/user/bimagic.git
cd bimagic

# Install dependencies
npm install

# Run build
npm run build

# Run unit & integration tests
npm run test

# Run CLI locally in development mode
npm run dev
```
