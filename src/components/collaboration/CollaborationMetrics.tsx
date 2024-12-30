import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Metric {
  metric_type: string;
  total_value: number;
}

export const CollaborationMetrics = ({ workflowId }: { workflowId: string }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      // Only proceed if workflowId is valid
      if (!workflowId) {
        console.log('No workflow ID provided');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('collaboration_metrics')
          .select('metric_type, value')
          .eq('workflow_id', workflowId);

        if (error) {
          console.error('Error loading metrics:', error);
          return;
        }

        // Aggregate metrics by type
        const aggregatedMetrics = data.reduce((acc: Metric[], curr) => {
          const existing = acc.find(m => m.metric_type === curr.metric_type);
          if (existing) {
            existing.total_value += curr.value;
          } else {
            acc.push({ metric_type: curr.metric_type, total_value: curr.value });
          }
          return acc;
        }, []);

        setMetrics(aggregatedMetrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };

    loadMetrics();

    // Subscribe to real-time updates only if we have a valid workflowId
    if (workflowId) {
      const channel = supabase
        .channel('metrics_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'collaboration_metrics',
            filter: `workflow_id=eq.${workflowId}`
          },
          () => {
            loadMetrics(); // Reload metrics when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [workflowId]);

  // If no workflowId, show a message
  if (!workflowId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collaboration Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No workflow selected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Collaboration Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.length > 0 ? (
            metrics.map((metric) => (
              <div key={metric.metric_type} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{metric.total_value}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {metric.metric_type.replace('_', ' ')}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-muted-foreground">
              No metrics available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};