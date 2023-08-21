import os
import subprocess as sp
# ----------------------------- create -----------------------------
create = "ng new omra --routing=true --style=scss"
# --------------------------- change Dir ---------------------------
changeDir = "cd ./omra"
# ---------------------------- generate ----------------------------
generate = [
    "ng g c components/navbar --skip-tests",
    "ng g c components/navbar --skip-tests",
    "ng g c components/footer --skip-tests",
    "ng g c components/card --skip-tests",
    "ng g c pages/main --skip-tests",
    "ng g c pages/harm --skip-tests",
    "ng g c pages/madina --skip-tests",
    "ng g s services/login --skip-tests",
    "ng g s services/data --skip-tests",
    "ng g g services/admin --skip-tests --implements=CanActivate",
]
# ---------------------------- install ----------------------------
install = [
    'npm i bootstrap@5.3.1',
    'ng add @angular/fire'
]
# ---------------------------- git repo ----------------------------
gitRepo = ""
gitFirstCommands = [
    "git add .",
    "git commit -m 'auto-commit'",
    "git branch -M main",
    f"git remote add origin {gitRepo}",
    "git push -u origin main"
]
gitFirstCommands = (" && ").join(gitFirstCommands)

gitCommands = [
    "git add .",
    "git commit -m 'auto-commit'",
    "git push -u origin main"
]
gitCommands = (" && ").join(gitCommands)
# ----------------------------- build -----------------------------
build = "npm run build"
# --------------------------- changeBase ---------------------------


def changeBase():
    with open('./docs/index.html', encoding='utf-8') as file:
        lines = file.readlines()
        html = ("").join(lines)
        replacedHtml = html.replace('<base href="/">', '<base href=".">')

    f = open("./docs/index.html", "w")
    f.write(replacedHtml)
    f.close()

# --------------------------- changeBase ---------------------------


def changeBuildDir():
    with open('./tsconfig.json', encoding='utf-8') as file:
        lines = file.readlines()
        json = (" ").join(lines)
        replacedJson = json.replace('"outDir": "./dist/out-tsc",', '"outDir": "./docs",')

    f = open("./angular.json", "w")
    f.write(replacedJson)
    f.close()

    with open('./tsconfig.json', encoding='utf-8') as file:
        lines = file.readlines()
        json = (" ").join(lines)
        replacedJson = json.replace('"outputPath": "dist/food-calculator"', '"outputPath": "docs"')

    f = open("./angular.json", "w")
    f.write(replacedJson)
    f.close()


# ---------------------------- deploy ----------------------------
deploy = "firebase deploy"
# ---------------------------- script ----------------------------
# changeBuildDir()
sp.call(build, shell=True)
changeBase()
sp.call(gitCommands, shell=True)
sp.call(deploy, shell=True)
