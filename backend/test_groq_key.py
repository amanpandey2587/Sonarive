import os
import sys

def test_hadoop_home():
    print("── 1. HADOOP_HOME env var ──────────────────────────")
    hadoop_home = os.environ.get("HADOOP_HOME","D:\hadoop")
    if not hadoop_home:
        print("❌ HADOOP_HOME is not set")
        return False
    print(f"✅ HADOOP_HOME = {hadoop_home}")
    return hadoop_home

def test_hadoop_files(hadoop_home):
    print("\n── 2. winutils.exe & hadoop.dll ────────────────────")
    winutils = os.path.join(hadoop_home, "bin", "winutils.exe")
    hadoopdll = os.path.join(hadoop_home, "bin", "hadoop.dll")

    winutils_ok = os.path.exists(winutils)
    hadoopdll_ok = os.path.exists(hadoopdll)

    print(f"{'✅' if winutils_ok  else '❌'} winutils.exe  -> {winutils}")
    print(f"{'✅' if hadoopdll_ok else '❌'} hadoop.dll    -> {hadoopdll}")

    return winutils_ok and hadoopdll_ok

def test_pyspark():
    print("\n── 3. PySpark import ───────────────────────────────")
    try:
        from pyspark.sql import SparkSession
        print("✅ PySpark imported successfully")
        return True
    except ImportError as e:
        print(f"❌ PySpark import failed: {e}")
        return False

def test_spark_session():
    print("\n── 4. SparkSession startup ─────────────────────────")
    try:
        from pyspark.sql import SparkSession
        spark = (
            SparkSession.builder
            .appName("HadoopTest")
            .master("local[1]")
            .config("spark.sql.shuffle.partitions", "2")
            .getOrCreate()
        )
        spark.sparkContext.setLogLevel("ERROR")
        print(f"✅ SparkSession created  (Spark {spark.version})")
        return spark
    except Exception as e:
        print(f"❌ SparkSession failed: {e}")
        return None

def test_basic_query(spark):
    print("\n── 5. Basic Spark query ────────────────────────────")
    try:
        df = spark.createDataFrame(
            [("High", 120), ("Medium", 85), ("Low", 60)],
            ["risk_level", "word_count"]
        )
        from pyspark.sql import functions as F
        result = df.groupBy("risk_level").agg(F.avg("word_count").alias("avg_words")).collect()
        print("✅ Query ran successfully. Results:")
        for row in result:
            print(f"   {row['risk_level']:<8} -> avg words: {row['avg_words']:.1f}")
        return True
    except Exception as e:
        print(f"❌ Query failed: {e}")
        return False

def test_parquet(spark):
    print("\n── 6. Parquet write & read ─────────────────────────")
    test_path = r"D:\hadoop\__spark_test_parquet"
    try:
        df = spark.createDataFrame([("test", 1)], ["col1", "col2"])
        df.write.mode("overwrite").parquet(test_path)
        df2 = spark.read.parquet(test_path)
        count = df2.count()
        print(f"✅ Parquet write/read OK  (rows: {count})")

        # cleanup
        import shutil
        shutil.rmtree(test_path, ignore_errors=True)
        return True
    except Exception as e:
        print(f"❌ Parquet test failed: {e}")
        return False


if __name__ == "__main__":
    print("=" * 52)
    print("   Hadoop + Spark Setup Verification")
    print("=" * 52)

    results = {}

    hadoop_home = test_hadoop_home()
    results["HADOOP_HOME"]    = bool(hadoop_home)
    results["Hadoop files"]   = test_hadoop_files(hadoop_home) if hadoop_home else False
    results["PySpark import"] = test_pyspark()

    spark = None
    if results["PySpark import"]:
        spark = test_spark_session()
        results["SparkSession"] = bool(spark)

    if spark:
        results["Basic query"] = test_basic_query(spark)
        results["Parquet I/O"] = test_parquet(spark)
        spark.stop()

    print("\n" + "=" * 52)
    print("   Summary")
    print("=" * 52)
    all_passed = True
    for name, passed in results.items():
        print(f"  {'✅' if passed else '❌'} {name}")
        if not passed:
            all_passed = False

    print("=" * 52)
    if all_passed:
        print("🎉 All checks passed — Spark is ready!")
    else:
        print("⚠️  Some checks failed — review the output above.")

    sys.exit(0 if all_passed else 1)