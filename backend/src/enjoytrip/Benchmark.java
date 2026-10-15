package enjoytrip;
import java.util.*;
import java.lang.management.ManagementFactory;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;

/** Reproducible local microbenchmark, not a JMH or production capacity claim. */
public final class Benchmark {
    private static volatile long sink;
    private static final int WARMUP=5,RUNS=9;
    private static final com.sun.management.ThreadMXBean MEMORY=(com.sun.management.ThreadMXBean)ManagementFactory.getThreadMXBean();
    record Measure(double medianMs,long medianAllocatedBytes){}
    static Measure measure(Runnable job){
        for(int i=0;i<WARMUP;i++)job.run();long[] times=new long[RUNS],bytes=new long[RUNS];long id=Thread.currentThread().threadId();
        for(int i=0;i<RUNS;i++){long b=MEMORY.getThreadAllocatedBytes(id),t=System.nanoTime();job.run();times[i]=System.nanoTime()-t;bytes[i]=MEMORY.getThreadAllocatedBytes(id)-b;}
        Arrays.sort(times);Arrays.sort(bytes);return new Measure(times[RUNS/2]/1e6,bytes[RUNS/2]);
    }
    public static void main(String[] args)throws Exception{
        if(!MEMORY.isThreadAllocatedMemorySupported())throw new IllegalStateException("Allocation measurement unavailable");MEMORY.setThreadAllocatedMemoryEnabled(true);
        StringBuilder csv=new StringBuilder("workload,n,algorithm,median_ms,median_allocated_bytes\n");
        for(int n:new int[]{100,1000,10000}){
            Random random=new Random(1604+n);var rows=new Algorithms.Ranked[n];
            for(int i=0;i<n;i++)rows[i]=new Algorithms.Ranked(null,i,random.nextDouble()*500);
            add(csv,"distance-sort",n,"selection",measure(()->{var a=rows.clone();Algorithms.selectionSort(a);sink+=a[n/2].inputIndex();}));
            add(csv,"distance-sort",n,"merge",measure(()->{var a=rows.clone();Algorithms.mergeSort(a);sink+=a[n/2].inputIndex();}));
            for(boolean adversarial:new boolean[]{false,true}){
                String[] texts=new String[n];String pattern=adversarial?"a".repeat(63)+"b":"종로";
                for(int i=0;i<n;i++)texts[i]=adversarial?"a".repeat(512)+(i%4==0?"b":"c"):(i%4==0?"서울 종로구 관광지 ":"부산 해운대 여행지 ")+i;
                String workload=adversarial?"repeated-prefix-search":"typical-search";
                for(String method:List.of("naive","kmp","jdk-contains"))add(csv,workload,n,method,measure(()->{
                    int[] pi=method.equals("kmp")?Algorithms.prefix(pattern):null;long count=0;
                    for(String text:texts)if(switch(method){case "naive"->Algorithms.containsNaive(text,pattern);case "kmp"->Algorithms.containsKmp(text,pattern,pi);default->text.contains(pattern);})count++;sink+=count;
                }));
            }
        }
        Path dir=Path.of("docs/benchmarks");Files.createDirectories(dir);Files.writeString(dir.resolve("results.csv"),csv,StandardCharsets.UTF_8);
        Files.writeString(dir.resolve("environment.txt"),"Java: "+System.getProperty("java.runtime.version")+"\nVM: "+System.getProperty("java.vm.name")+"\nOS: "+System.getProperty("os.name")+" "+System.getProperty("os.arch")+"\nProcessors: "+Runtime.getRuntime().availableProcessors()+"\nSeed: 1604+n\nWarmup: "+WARMUP+"\nMeasured repetitions: "+RUNS+"\nHeap: -Xms256m -Xmx256m\nMemory: per-thread allocated bytes, not peak heap\nChecksum: "+sink+"\n");
        System.out.print(csv);
    }
    private static void add(StringBuilder c,String w,int n,String a,Measure m){c.append(String.format(Locale.ROOT,"%s,%d,%s,%.6f,%d%n",w,n,a,m.medianMs,m.medianAllocatedBytes));}
}
