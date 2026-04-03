<template>
  <div class="space-y-8 animate-in fade-in duration-500 pb-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Menu Categories</h2>
        <p class="text-muted-foreground text-sm font-medium">Structure your catalog with logical groupings.</p>
      </div>

      <Dialog v-model:open="isModalOpen">
        <DialogTrigger as-child>
          <Button @click="openModal()" class="rounded-lg h-10 px-4" :disabled="!currentShopId">
            <LucidePlus class="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle class="text-xl font-bold tracking-tight">{{ form.id ? 'Edit Category' : 'New Category' }}</DialogTitle>
            <DialogDescription class="text-xs font-medium">Define a new classification for your dishes.</DialogDescription>
          </DialogHeader>

          <form @submit.prevent="saveCategory" class="space-y-5 pt-3">
            <div class="space-y-1.5">
               <Label class="text-xs font-bold text-muted-foreground px-0.5">Category Name</Label>
               <Input v-model="form.name" placeholder="Desserts, Drinks..." required class="h-10 rounded-lg bg-background" />
            </div>

            <div class="space-y-1.5">
               <Label class="text-xs font-bold text-muted-foreground px-0.5">Display Priority</Label>
               <Input v-model.number="form.order_index" type="number" required class="h-10 rounded-lg bg-background" />
               <p class="text-[10px] text-muted-foreground font-medium px-0.5">Higher numbers appear first in the menu.</p>
            </div>

            <DialogFooter class="pt-2">
              <Button type="button" variant="ghost" @click="isModalOpen = false" class="rounded-lg h-10 px-6 text-xs font-bold">Cancel</Button>
              <Button type="submit" :disabled="isSaving" class="rounded-lg h-10 px-8 text-xs font-bold">
                <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                {{ form.id ? 'Save Changes' : 'Confirm' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteModalOpen">
      <DialogContent class="sm:max-w-md rounded-lg p-8">
        <DialogHeader class="space-y-3">
          <div class="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive mb-2">
            <LucideAlertTriangle class="w-5 h-5" />
          </div>
          <DialogTitle class="text-xl font-bold tracking-tight">Remove Category?</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground leading-relaxed">
            Are you sure you want to delete <span class="text-foreground font-bold">"{{ categoryToDelete?.name }}"</span>? Menu items in this category will become unclassified.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-row gap-2 pt-6 border-t border-border">
          <Button variant="ghost" @click="isDeleteModalOpen = false" class="flex-1 rounded-lg h-10 text-xs font-bold">Discard</Button>
          <Button variant="destructive" @click="confirmDelete" class="flex-1 rounded-lg h-10 text-xs font-bold">
            <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Card class="border border-border shadow-none overflow-hidden rounded-lg">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="text-[10px] font-bold uppercase tracking-wider">Classification</TableHead>
            <TableHead class="text-[10px] font-bold uppercase tracking-wider">Weight</TableHead>
            <TableHead class="text-right text-[10px] font-bold uppercase tracking-wider">Control</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="category in categories" :key="category.id" class="hover:bg-muted/30 transition-colors">
            <TableCell class="font-bold text-xs text-foreground tracking-tight">{{ category.name }}</TableCell>
            <TableCell>
              <Badge variant="secondary" class="rounded-md px-2 font-mono text-[10px] h-5">{{ category.order_index }}</Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <Button variant="ghost" size="icon" class="rounded-lg h-8 w-8 text-muted-foreground hover:text-foreground" @click="openModal(category)">
                   <LucidePencil class="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" class="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5" @click="deleteCategory(category)">
                   <LucideTrash2 class="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="!pending && (categories?.length || 0) === 0">
            <TableCell colspan="3" class="h-40 text-center text-muted-foreground text-xs font-medium italic">
              {{ !currentShopId ? 'Select a store location' : 'Category list is clear' }}
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
