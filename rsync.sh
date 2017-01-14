#!/bin/sh

OLD_IFS="$IFS"
IFS=","
files=($1)
test_dir=$2
online_dir=$3
commit_msg=$4
iNow=0

# 文件目录转换为数组
for s in ${files[@]}
do
	files[$iNow]=$s
	iNow=`expr $iNow + 1`
done
IFS="$OLD_IFS"

# 检测测试环境当前目录是否存在
if [ ! -d $test_dir ]
	then
	echo "测试环境的文件目录 ( $test_dir ) 未找到"
	exit 1
fi
# 检测生成环境当前目录是否存在
if [ ! -d $online_dir ]
	then
	echo "生产环境的文件目录 ( $online_dir ) 未找到"
	exit 1
fi

# 执行覆盖文件操作
echo "复制文件到正式线中..."

svn up $online_dir

cd $test_dir
for path in $files
do
	echo "移动 $path 到 $online_dir"
	rsync -ravu --delete $path $online_dir
    #cp -rfu $localTrunk $path $online_dir
done

echo ""

cd $online_dir
echo "改动文件"
echo `svn status`

