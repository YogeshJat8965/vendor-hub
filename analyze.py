import glob
import re

files = glob.glob("*.md")
total_x = 0
total_space = 0
total_check = 0
total_cross = 0

print("Project Analysis:")
print("-" * 50)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        x = len(re.findall(r'\[x\]', content, re.IGNORECASE))
        space = len(re.findall(r'\[\s\]', content))
        check = len(re.findall(r'✅', content))
        cross = len(re.findall(r'❌', content))
        
        total_x += x
        total_space += space
        total_check += check
        total_cross += cross
        
        if x + space + check + cross > 0:
            print(f"{file}:")
            if x + space > 0:
                print(f"  [x] Completed: {x}, [ ] Remaining: {space}")
            if check + cross > 0:
                print(f"  ✅ Completed: {check}, ❌ Remaining: {cross}")

print("-" * 50)
print(f"Total [x]: {total_x}")
print(f"Total [ ]: {total_space}")
print(f"Total ✅: {total_check}")
print(f"Total ❌: {total_cross}")
if (total_x + total_space) > 0:
    print(f"Percentage based on checkboxes: {total_x / (total_x + total_space) * 100:.2f}%")
if (total_check + total_cross) > 0:
    print(f"Percentage based on emojis: {total_check / (total_check + total_cross) * 100:.2f}%")
