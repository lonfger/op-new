def convert_format(input_file, output_file):
    with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
        for line in infile:
            line = line.strip()
            if line:
                parts = line.split(':')
                if len(parts) == 4:
                    converted_line = f"{parts[2]}:{parts[3]}@{parts[0]}:{parts[1]}"
                    outfile.write(converted_line + '\n')

# 输入文件名和输出文件名
input_filename = 'input.txt'
output_filename = 'output.txt'

# 调用转换函数
convert_format(input_filename, output_filename)
