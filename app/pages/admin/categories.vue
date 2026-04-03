<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Menu Categories</h2>
        <p class="text-muted-foreground text-sm">Organize your shop catalog into logical groups.</p>
      </div>

      <Dialog v-model:open="isModalOpen">
        <DialogTrigger as-child>
          <Button @click="openModal()" class="rounded-full shadow-lg" :disabled="!currentShopId">
            <LucidePlus class="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{{ form.id ? 'Edit Category' : 'New Category' }}</DialogTitle>
            <DialogDescription>Input classification details for your menu items.</DialogDescription>
          </DialogHeader>

          <form @submit.prevent="saveCategory" class="space-y-4 pt-4">
            <div class="space-y-2">
              <Label for="cat_name">Category Name</Label>
              <Input id="cat_name" v-model="form.name" placeholder="E.g. Main Courses, Drinks, Desserts" required />
            </div>

            <div class="space-y-2">
               <Label for="cat_order">Display Priority (Higher = First)</Label>
               <Input id="cat_order" v-model.number="form.order_index" type="number" required />
            </div>

            <DialogFooter class="pt-4">
              <Button type="button" variant="ghost" @click="isModalOpen = false">Cancel</Button>
              <Button type="submit" :disabled="isSaving">
                <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                {{ form.id ? 'Save Changes' : 'Create Category' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteModalOpen">
      <DialogContent class="sm:max-w-md bg-card border-border rounded-[32px] p-8">
        <DialogHeader class="space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
            <LucideAlertTriangle class="w-6 h-6" />
          </div>
          <DialogTitle class="text-2xl font-black uppercase italic tracking-tighter">Confirm Deletion</DialogTitle>
          <DialogDescription class="text-sm font-medium italic text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete <span class="text-foreground font-bold font-sans not-italic">"{{ categoryToDelete?.name }}"</span>?
            <br/><br/>
            All menu items associated with this category will lose their classification.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-row gap-3 pt-6 border-t border-border/50">
          <Button variant="ghost" @click="isDeleteModalOpen = false" class="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest">Keep It</Button>
          <Button variant="destructive" @click="confirmDelete" class="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-destructive/20">
            <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            Delete Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Card class="border-border shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inventory Classification</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="category in categories" :key="category.id" class="group transition-colors hover:bg-muted/50">
            <TableCell class="font-medium text-foreground tracking-tight">{{ category.name }}</TableCell>
            <TableCell>
              <Badge variant="secondary" class="rounded-full px-3 font-mono">{{ category.order_index }}</Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <Button variant="ghost" size="icon" class="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground" @click="openModal(category)">
                   <LucidePencil class="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" class="rounded-full h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10" @click="deleteCategory(category)">
                   <LucideTrash2 class="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="!pending && (categories?.length || 0) === 0">
            <TableCell colspan="3" class="h-40 text-center text-muted-foreground italic">
              {{ !currentShopId ? 'Please select a shop location to begin' : 'No categories created for this location yet.' }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, Loader2 as LucideLoader2, 
  Pencil as LucidePencil, Trash2 as LucideTrash2, AlertTriangle as LucideAlertTriangle
} from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from '~/components/ui/dialog';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

interface Category { id: string; name: string; order_index: number; }

const currentShopId = useState<string | null>('currentShopId');
const token = useCookie('token');

const { data: categories, refresh: refreshCategories, pending } = await useFetch<Category[]>(() => 
  currentShopId.value ? `/api/admin/categories?shopId=${currentShopId.value}` : '/api/admin/categories?shopId=none', 
  { headers: { Authorization: `Bearer ${token.value}` } }
);

const isModalOpen = ref(false);
const isSaving = ref(false);
const form = reactive({
  id: null as string | null,
  name: '',
  order_index: 0
});

const openModal = (category: any = null) => {
  if (category) {
    Object.assign(form, category);
  } else {
    Object.assign(form, { id: null, name: '', order_index: 0 });
  }
  isModalOpen.value = true;
};

const saveCategory = async () => {
  if (!currentShopId.value) return;
  isSaving.value = true;
  try {
    const isEdit = !!form.id;
    const url = isEdit ? `/api/admin/categories/${form.id}` : '/api/admin/categories';
    
    await $fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body: { ...form, shop_id: currentShopId.value },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success(isEdit ? 'Category Updated' : 'Category Created', {
      description: `"${form.name}" has been saved successfully.`
    });
    
    isModalOpen.value = false;
    refreshCategories();
  } catch (e: any) {
    toast.error('Operation Failed', {
      description: e.data?.message || 'Could not save the category.'
    });
  } finally {
    isSaving.value = false;
  }
};

const isDeleteModalOpen = ref(false);
const categoryToDelete = ref<Category | null>(null);

const deleteCategory = (category: Category) => {
  categoryToDelete.value = category;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!categoryToDelete.value) return;
  isSaving.value = true;
  
  try {
    await $fetch(`/api/admin/categories/${categoryToDelete.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success('Category Purged', {
      description: `"${categoryToDelete.value.name}" has been removed from the system.`
    });
    
    isDeleteModalOpen.value = false;
    refreshCategories();
  } catch (e: any) {
    toast.error('Purge Failed', {
      description: e.data?.message || 'The category could not be removed.'
    });
  } finally {
    isSaving.value = false;
  }
};

watch(currentShopId, () => refreshCategories());
</script>
