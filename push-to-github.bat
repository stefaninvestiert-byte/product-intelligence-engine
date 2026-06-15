@echo off
echo === Product Intelligence Engine - GitHub Push ===
cd /d "C:\Users\sts.W005472\Desktop\product-intelligence-engine"

echo Initialisiere Git...
git init
git config user.email "stefaninvestiert@gmx.at"
git config user.name "Stefan Scheiber"

echo Dateien hinzufuegen...
git add .
git status

echo Commit erstellen...
git commit -m "feat: Product Intelligence Engine mit neuer 4-Dimension Winner Score Formel (PS 35% + Competition 25% + Demand 25% + Profit 15%)"

echo Branch main setzen...
git branch -M main

echo Remote hinzufuegen...
git remote remove origin 2>nul
git remote add origin https://github.com/stefaninvestiert-byte/product-intelligence-engine.git

echo Push zu GitHub...
git push -u origin main

echo.
echo === FERTIG! Code ist auf GitHub. ===
echo Naechster Schritt: Vercel Setup
pause
